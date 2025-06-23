const express = require("express");
const formidable = require("formidable");
const { preprocessResume } = require("../services/preprocessResume");
const { analyzeResume } = require("../services/resumeAnalyzer"); 

const router = express.Router();

router.post("/analyze-resume-pdf", (req, res) => {
  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, _fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });

    const file = files.resume?.[0] || files.resume;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (file.size > 2 * 1024 * 1024)
      return res.status(400).json({ error: "Max file size: 2 MB" });

    console.time("TotalResumeAnalysis");

    try {
      console.time("Preprocess");
      const text = await preprocessResume(file.filepath);
      console.timeEnd("Preprocess");

      console.log("\n📝 TEXT EXTRACTED FROM RESUME:\n", text.slice(0, 400), "...");

      console.time("AIAnalysis");
      const analysis = await analyzeResume(text);
      console.timeEnd("AIAnalysis");

      console.log("\n✅ FINAL AI ANALYSIS RESULT:\n", analysis);

      console.timeEnd("TotalResumeAnalysis");

      res.json({ analysis });
    } catch (e) {
      console.error("❌ Server Error:", e.message);
      res.status(500).json({ error: e.message });
    }
  });
});

module.exports = router;
