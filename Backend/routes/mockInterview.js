const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  createMockInterview,
  transcribeVideo,
  analyzeTranscript,
  getInterviewResult,
} = require("../controllers/mockInterview.js");

const verifyToken = require("../middleware/verifyToken.js");

const router = express.Router();

/* 🧠 Setup multer for video uploads */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Limit: 100MB
});

/* ───────────────── Routes ───────────────── */
router.post("/create", verifyToken, createMockInterview);         // Step 1
router.post("/:id/transcribe", upload.single("video"), transcribeVideo); // Step 5
router.post("/:id/analyze", verifyToken, analyzeTranscript);      // Step 7
router.get("/:id/result", getInterviewResult);                    // Step 8

module.exports = router;
