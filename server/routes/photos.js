import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { fileTypeFromFile } from "file-type";
import sharp from "sharp";
import { upload, UPLOAD_DIR, handleUploadError } from "../middleware/upload.js";

const router = Router();

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// Matches <uuid>.<ext> and <uuid>_thumb.<ext>
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(_thumb)?\.(jpg|jpeg|png|webp|gif)$/i;

// POST /api/upload — upload photos
router.post("/", upload.array("photos", 5), handleUploadError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const results = [];

    for (const file of req.files) {
      // Magic-byte validation
      const type = await fileTypeFromFile(file.path);

      if (!type || !ALLOWED_MIMES.includes(type.mime)) {
        // Delete the rejected file
        await fs.unlink(file.path).catch(() => {});
        return res
          .status(400)
          .json({ error: `Rejected file type: ${type?.mime || "unknown"}` });
      }

      // Generate thumbnail (300px wide)
      const ext = path.extname(file.filename).toLowerCase();
      const thumbFilename = file.filename.replace(ext, `_thumb${ext}`);
      const thumbPath = path.join(UPLOAD_DIR, thumbFilename);

      await sharp(file.path)
        .resize(300, null, { withoutEnlargement: true })
        .toFile(thumbPath);

      results.push({
        originalName: file.originalname,
        filename: file.filename,
        thumbnailFilename: thumbFilename,
      });
    }

    res.json(results);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

// GET /api/uploads/:filename — serve uploaded photos
router.get("/:filename", async (req, res) => {
  const { filename } = req.params;

  // Reject path traversal
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return res.status(400).json({ error: "Invalid filename" });
  }

  // Validate UUID format
  if (!UUID_REGEX.test(filename)) {
    return res.status(400).json({ error: "Invalid filename format" });
  }

  const filePath = path.resolve(UPLOAD_DIR, filename);

  // Verify resolved path is inside uploads dir
  if (!filePath.startsWith(UPLOAD_DIR)) {
    return res.status(400).json({ error: "Path traversal detected" });
  }

  try {
    await fs.access(filePath);
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.sendFile(filePath);
  } catch {
    res.status(404).json({ error: "File not found" });
  }
});

export default router;
