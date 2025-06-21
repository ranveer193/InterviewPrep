const path = require("path");

const uploadVideo = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/tempUploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: "Upload successful",
      fileUrl,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "File upload failed" });
  }
};
module.exports = { uploadVideo };
