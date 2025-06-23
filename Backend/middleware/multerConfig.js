// utils/multerConfig.js
const multer = require("multer");
const path   = require("path");

// ── 1. Storage strategy ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, "../tempUploads");
    console.log("📥 [multer] Destination  →", dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Force every *video* file to use .mp4 (needed for Gradio Video input)
    const ext      = file.mimetype.startsWith("video/")
                   ? ".mp4"
                   : path.extname(file.originalname).toLowerCase();

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`;
    console.log("📥 [multer] Saved file   →", filename, "| MIME:", file.mimetype);
    cb(null, filename);
  },
});

// ── 2. File-type guard ───────────────────────────────────────────────
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype.startsWith("video/") || file.mimetype.startsWith("audio/");
    console.log(
      "🔍 [multer] Filtering file:",
      file.originalname,
      "| MIME:", file.mimetype,
      "| accepted?", ok
    );

    if (ok) cb(null, true);
    else    cb(new Error("Invalid file type: only video/* or audio/* allowed"));
  },
});

module.exports = upload;
