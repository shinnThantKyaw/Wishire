---
name: photo-upload-security
description: Security rules for multer-based photo uploads — UUID filenames, magic-byte validation, file count/size limits, controlled serve route, and path traversal prevention. Apply when building photoRoutes, upload middleware, or PhotoUploader component. Prevents Pitfall 3 (path traversal and file overwrite).
---

# Photo Upload Security

Every photo upload touchpoint must follow these rules. This is the difference between a secure upload pipeline and one where attackers can overwrite files or serve HTML as images.

Generated from PITFALLS.md Pitfall 3. All prevention strategies below are **mandatory**, not optional.

## Multer Disk Storage Configuration

```js
// server/middleware/upload.js
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

const UPLOAD_DIR = path.resolve(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uuid = crypto.randomUUID();
    cb(null, `${uuid}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,                  // max 5 files per request
  },
});
```

### Filename Rules (MANDATORY)

- **Always generate filenames server-side** using `crypto.randomUUID()`.
- **Never trust `file.originalname`** for disk storage. Store it in the database for display only.
- **No sequential IDs or timestamps** as filenames — predictable filenames enable enumeration and overwrite attacks.
- Keep the original extension (lowercased) for MIME type hinting, but never use it as the sole type check.

## File Type Validation — Magic Bytes (MANDATORY)

- **Validate magic bytes, not extensions.** An attacker can rename `evil.html` to `photo.jpg`.
- Use the `file-type` npm package to inspect the first bytes of the uploaded file.
- Allowlist only: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.

```js
// server/middleware/upload.js — add to the multer pipeline
const FileType = require('file-type');
const fs = require('fs');

async function validateImageType(filePath) {
  const buffer = fs.readFileSync(filePath);
  const type = await FileType.fromBuffer(buffer);

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!type || !allowed.includes(type.mime)) {
    fs.unlinkSync(filePath); // delete the rejected file
    throw new Error(`Rejected file type: ${type?.mime || 'unknown'}`);
  }
  return true;
}
```

### Validation Checklist (MANDATORY)
- Magic byte check happens **on the server**, after multer writes to disk but before the DB record is created.
- Rejected files are **deleted from disk immediately**.
- Validation is in the upload route handler, NOT just in the frontend. Frontend validation is UX convenience only.

## Serve Uploads via Controlled Route (MANDATORY)

- **Do NOT use `express.static('uploads')`** directly. It exposes all files at guessable URLs.
- Use a controller route that validates the filename format before reading from disk:

```js
// server/routes/photos.js
app.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;

  // Reject path traversal characters
  if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  // Validate UUID format: <uuid>.<ext>
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|gif)$/i;
  if (!uuidPattern.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename format' });
  }

  const filePath = path.resolve(UPLOAD_DIR, filename);

  // Verify the resolved path is still inside the uploads directory
  if (!filePath.startsWith(UPLOAD_DIR)) {
    return res.status(400).json({ error: 'Path traversal detected' });
  }

  // Set aggressive caching — filenames are UUIDs, content never changes
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(filePath);
});
```

## File Size Limits — Two Layers

- **Multer layer:** `limits.fileSize: 5 * 1024 * 1024` blocks oversized files during multipart parsing.
- **Express body layer:** `express.json({ limit: '1mb' })` for general routes — uploads use multipart, not JSON. Never send photos as base64 in JSON bodies.

## Path Traversal Prevention (MANDATORY)

- Resolve the full absolute path before reading or writing.
- Verify the resolved path starts with the allowed base directory (`UPLOAD_DIR`).
- Reject filenames containing `/`, `\`, `..`, null bytes, or any non-UUID-extension pattern.
- This applies to both the upload write path and the serve read path.

## Photo Count Enforcement

- Multer `limits.files: 5` blocks uploads with more than 5 files.
- Server-side check in the route handler: count `req.files.length` and reject if > 5 (belt-and-suspenders).
- Per-wish: a wish can have 0–5 photos. Enforce this at the wish creation endpoint — reject if `photoUrls.length > 5`.

## Cache Headers for Uploaded Photos

```js
res.set('Cache-Control', 'public, max-age=31536000, immutable');
```

- UUID filenames are permanent. Content never changes. Aggressive caching is safe and necessary for mobile performance.

## When Building These Files

- `server/middleware/upload.js` — multer config, storage, limits
- `server/routes/photos.js` — upload endpoint and controlled serve route
- `client/src/components/create/PhotoUploader.jsx` — drag/drop UI (client validation is UX only)
- `server/services/wishService.createWish()` — enforce photo count on creation
