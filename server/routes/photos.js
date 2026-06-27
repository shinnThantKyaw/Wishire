import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { fileTypeFromBuffer } from "file-type";
import cloudinary from "../lib/cloudinary.js";
import { upload, handleUploadError } from "../middleware/upload.js";
import { asyncHandler, ValidationError } from "../lib/errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, "../uploads");

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(_thumb)?\.(jpg|jpeg|png|webp|gif)$/i;

const router = Router();

/**
 * Upload a buffer to Cloudinary via upload_stream.
 * Returns the upload result with secure_url, public_id, etc.
 */
function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

/**
 * Insert a Cloudinary URL transformation after "/upload/".
 * Original: https://res.cloudinary.com/.../upload/v1234/wishire/abc.jpg
 * Thumb:    https://res.cloudinary.com/.../upload/w_300,c_limit/v1234/wishire/abc.jpg
 */
function thumbnailUrl(secureUrl) {
  return secureUrl.replace("/upload/", "/upload/w_300,c_limit/");
}

// POST /api/upload — upload photos to Cloudinary
router.post("/", upload.array("photos", 5), handleUploadError, asyncHandler(async (req, res) => {
  if (!process.env.CLOUDINARY_URL) {
    return res.status(503).json({
      error: "Photo upload not configured. Set CLOUDINARY_URL environment variable.",
    });
  }

  if (!req.files || req.files.length === 0) {
    throw new ValidationError("No files uploaded");
  }

  const results = [];

  for (const file of req.files) {
    // Magic-byte validation on the buffer
    const type = await fileTypeFromBuffer(file.buffer);

    if (!type || !ALLOWED_MIMES.includes(type.mime)) {
      throw new ValidationError(
        "Rejected file type: " + (type?.mime || "unknown")
      );
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.buffer, {
      folder: "wishire",
      tags: ["wish"],
      resource_type: "image",
    });

    results.push({
      originalName: file.originalname,
      filename: result.secure_url,
      thumbnailFilename: thumbnailUrl(result.secure_url),
    });
  }

  res.json(results);
}));

// GET /api/uploads/:filename — legacy: serve locally-stored photos
// Kept for backward compatibility with any existing local files.
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
