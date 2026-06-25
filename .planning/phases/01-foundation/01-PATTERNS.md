# Phase 1: Foundation - Pattern Map

**Mapped:** 2026-06-20
**Files analyzed:** 6 (2 new, 4 modified)
**Analogs found:** 6 / 6

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `server/lib/errors.js` | utility | transform (error class definitions) | `server/middleware/upload.js` (lines 45-58, error handler pattern) | role-match |
| `server/middleware/errorHandler.js` | middleware | request-response | `server/middleware/upload.js` (lines 45-58, `handleUploadError`) | exact |
| `server/services/wishService.js` | service | CRUD | `server/services/wishService.js` (existing file, refactor in place) | self |
| `server/routes/wishes.js` | route (controller) | request-response | `server/routes/wishes.js` (existing file, refactor in place) | self |
| `server/routes/photos.js` | route (controller) | request-response | `server/routes/photos.js` (existing file, refactor in place) | self |
| `server/index.js` | config (server entry) | request-response | `server/index.js` (existing file, add 1 import + 1 line) | self |

## Pattern Assignments

### `server/lib/errors.js` (utility, transform)

**New file.** No direct analog exists for custom error classes in this codebase. The closest structural analog is the error-handling pattern in `server/middleware/upload.js` (lines 45-58) which demonstrates Express error formatting. The research document provides the exact pattern to follow.

**Module convention** -- from `server/package.json` line 3:
```json
"type": "module"
```
All server files use ESM `export`/`import` syntax.

**Error class pattern** -- from RESEARCH.md lines 274-299 (recommended code):
```javascript
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.code = 'VALIDATION_ERROR';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
    this.code = 'NOT_FOUND';
  }
}

export class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseError';
    this.status = 500;
    this.code = 'DB_ERROR';
  }
}
```

**asyncHandler utility** -- from RESEARCH.md lines 326-331 (recommended code). Per Open Question #2 in RESEARCH.md, this goes in the same file as the error classes:
```javascript
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

**No imports needed** -- pure utility file, no external dependencies.

---

### `server/middleware/errorHandler.js` (middleware, request-response)

**New file.** Closest analog is `server/middleware/upload.js` which is the only existing middleware file. Both serve as Express middleware functions.

**Module convention** -- from `server/middleware/upload.js` lines 1-4:
```javascript
import multer from "multer";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
```
All server files use ESM imports.

**Existing middleware pattern for reference** -- from `server/middleware/upload.js` lines 45-58:
```javascript
export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "File too large. Maximum size is 5MB per photo.",
      LIMIT_FILE_COUNT: "Too many files. Maximum is 5 photos per wish.",
      LIMIT_UNEXPECTED_FILE: "Unexpected field name. Use 'photos' for file uploads.",
    };
    return res.status(400).json({ error: messages[err.code] || err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
}
```
Note: The existing `handleUploadError` does its own `res.status().json()` inline. The new centralized handler should follow the same 4-arg signature but be more general.

**Error handler pattern** -- from RESEARCH.md lines 306-319:
```javascript
export function errorHandler(err, req, res, next) {
  console.error(`[${err.name || 'Error'}] ${err.message}`);

  const status = err.status || 500;
  const response = {
    error: err.message || 'Internal server error',
  };

  if (err.code) {
    response.code = err.code;
  }

  res.status(status).json(response);
}
```

**Key difference from existing handler:** This new handler surfaces `err.message` in 500 responses per decision D-03. The existing `wishes.js` line 39 hides real errors behind `"Failed to fetch wish"`.

---

### `server/services/wishService.js` (service, CRUD)

**Analog:** Self (existing file, refactor in place).

**Current error-throwing pattern** -- from `server/services/wishService.js` lines 27-36 (generic Error):
```javascript
  if (!senderName || !recipientName || !message) {
    throw new Error("senderName, recipientName, and message are required");
  }

  if (message.length > 1000) {
    throw new Error("Message must be 1000 characters or less");
  }

  if (photos.length > 5) {
    throw new Error("Maximum 5 photos allowed");
  }
```

**Current database error wrapping** -- from `server/services/wishService.js` lines 69-75:
```javascript
  } catch (dbErr) {
    throw new Error(
      `Database error creating wish: ${dbErr.message}` +
      (dbErr.code ? ` (code: ${dbErr.code})` : "")
    );
  }
```

**Current "not found" pattern** -- from `server/services/wishService.js` lines 98-99:
```javascript
  if (!wish) {
    throw new Error(`Wish not found: ${id}`);
  }
```

**Refactoring target** -- replace all `throw new Error(...)` with custom error class instances. Add import at top:
```javascript
import { ValidationError, NotFoundError, DatabaseError } from "../lib/errors.js";
```

Then replace:
- `throw new Error("senderName, recipientName, and message are required")` --> `throw new ValidationError("senderName, recipientName, and message are required")`
- `throw new Error("Message must be 1000 characters or less")` --> `throw new ValidationError("Message must be 1000 characters or less")`
- `throw new Error("Maximum 5 photos allowed")` --> `throw new ValidationError("Maximum 5 photos allowed")`
- `throw new Error(\`Wish not found: ${id}\`)` --> `throw new NotFoundError(\`Wish not found: ${id}\`)`
- `throw new Error("Wish not found")` (line 145) --> `throw new NotFoundError("Wish not found")`
- Database errors: `throw new Error(\`Database error...\`)` --> `throw new DatabaseError(...)`

---

### `server/routes/wishes.js` (route, request-response)

**Analog:** Self (existing file, refactor in place).

**Current inline error handling pattern** -- from `server/routes/wishes.js` lines 12-27:
```javascript
router.post("/", async (req, res) => {
  try {
    const wish = await createWish(req.body);
    res.status(201).json(wish);
  } catch (err) {
    console.error("Create wish error:", err);
    if (err.message.includes("required") || err.message.includes("Maximum")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({
      error: err.message || "Failed to create wish",
      code: err.code || undefined,
    });
  }
});
```

**Current string-matching anti-pattern** -- from `server/routes/wishes.js` lines 18, 35, 65:
```javascript
if (err.message.includes("required") || err.message.includes("Maximum")) {  // line 18
if (err.message === "Wish not found") {  // line 35
if (err.message === "Wish not found") {  // line 65
```

**Refactoring pattern** -- replace all inline try/catch with `asyncHandler`. Import at top:
```javascript
import { asyncHandler } from "../lib/errors.js";
```

Replace each handler to remove try/catch and wrap with asyncHandler. Example for POST:
```javascript
router.post("/", asyncHandler(async (req, res) => {
  const wish = await createWish(req.body);
  res.status(201).json(wish);
}));
```

Example for GET /:id:
```javascript
router.get("/:id", asyncHandler(async (req, res) => {
  const wish = await getWish(req.params.id);
  res.json(wish);
}));
```

Same pattern for all 4 route handlers (POST /, GET /:id, POST /:id/reactions, GET /:id/stats).

---

### `server/routes/photos.js` (route, request-response)

**Analog:** Self (existing file, refactor in place).

**Current inline error handling** -- from `server/routes/photos.js` lines 53-56:
```javascript
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
```

**Note:** The GET /:filename route (lines 60-87) has validation checks that return 400 inline (path traversal, UUID format). These are security checks that should remain inline rather than using the centralized handler, because they are request-parsing guards, not application errors. Keep them as-is.

**Refactoring target:** Only the POST / handler's catch block (line 53-56). Replace with `asyncHandler` wrapper and import:
```javascript
import { asyncHandler, ValidationError } from "../lib/errors.js";
```

The `req.files.length === 0` check (line 19) should throw `ValidationError("No files uploaded")` instead of returning inline.

---

### `server/index.js` (config, request-response)

**Analog:** Self (existing file, add error handler mount).

**Current route mounting pattern** -- from `server/index.js` lines 15-18:
```javascript
app.use("/api/wish", wishRoutes);
app.use("/api/upload", photoRoutes);
app.use("/api/uploads", photoRoutes);
```

**Current SPA catch-all** -- from `server/index.js` lines 24-34:
```javascript
app.get("*", (req, res) => {
  const indexPath = path.join(clientDist, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({
        error: "Client not built. Run 'cd client && npm run build' first.",
      });
    }
  });
});
```

**Refactoring target:** Add error handler import and mount AFTER the SPA catch-all (after line 34, before PORT declaration):
```javascript
import { errorHandler } from "./middleware/errorHandler.js";
```
```javascript
// Centralized error handler — must be LAST middleware (Pitfall B in research)
app.use(errorHandler);
```

Per Pitfall B in RESEARCH.md: the error handler MUST go after all route mounts and the SPA catch-all, as the very last `app.use()`.

---

## Shared Patterns

### ESM Module Convention
**Source:** `server/package.json` line 3 (`"type": "module"`)
**Apply to:** All new server files
```javascript
// All server files use ESM syntax
import { something } from "./path.js";
export function something() {}
```

### Error Response Format
**Source:** Decision D-01 in CONTEXT.md
**Apply to:** `server/middleware/errorHandler.js` (produces), all route files (delegate to handler)
```json
{
  "error": "human-readable message (always present)",
  "code": "MACHINE_READABLE_CODE (optional)"
}
```

### Error Codes
**Source:** Decision D-02 in CONTEXT.md
**Apply to:** Error classes in `server/lib/errors.js`

| Error Class | HTTP Status | Code |
|-------------|-------------|------|
| `ValidationError` | 400 | `VALIDATION_ERROR` |
| `NotFoundError` | 404 | `NOT_FOUND` |
| `DatabaseError` | 500 | `DB_ERROR` |

### Async Error Handling
**Source:** RESEARCH.md Pattern 3 + Pitfall A
**Apply to:** All route files (`wishes.js`, `photos.js`)
```javascript
// Wrap every async route handler with asyncHandler
router.get("/:id", asyncHandler(async (req, res) => {
  // no try/catch needed — errors propagate to errorHandler middleware
}));
```

### Error Surfacing in 500s
**Source:** Decision D-03 in CONTEXT.md
**Apply to:** `server/middleware/errorHandler.js`
```javascript
// Always use err.message, never a generic string
const response = { error: err.message || 'Internal server error' };
```

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `server/lib/errors.js` | utility | transform | No custom error classes exist in codebase; use RESEARCH.md code examples directly |

## Metadata

**Analog search scope:** `server/` (excluding `lib/generated/prisma/`)
**Files scanned:** 8 (`index.js`, `routes/wishes.js`, `routes/photos.js`, `services/wishService.js`, `middleware/upload.js`, `lib/prisma.js`, `lib/flair.js`, `mcp-server.js`)
**Pattern extraction date:** 2026-06-20
