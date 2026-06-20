import multer from "multer";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOAD_DIR = path.resolve(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uuid = crypto.randomUUID();
    cb(null, `${uuid}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5, // max 5 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."));
    }
  },
});

/**
 * Express middleware to handle multer errors with clear messages.
 * Place after upload middleware in route definitions.
 */
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
