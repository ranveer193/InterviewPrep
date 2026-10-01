const express = require("express");
const formidable = require("formidable");
const fs = require("fs");
const { preprocessResume } = require("../services/preprocessResume");
const { splitIntoSections } = require("../services/splitIntoSections");
const { analyzeResume } = require("../services/resumeAnalyzer");

const router = express.Router();

router.post("/analyze-resume-pdf", (req, res) => {
  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, _fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });

    const file = files.resume?.[0] || files.resume;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (file.size > 2 * 1024 * 1024) {
      if (file.filepath) fs.unlink(file.filepath, () => {});
      return res.status(400).json({ error: "Max file size: 2 MB" });
    }

    console.time("TotalResumeAnalysis");

    try {
      console.time("Preprocess");
      const text = await preprocessResume(file.filepath);
      console.timeEnd("Preprocess");

      console.log("\n📝 TEXT EXTRACTED FROM RESUME:\n", text.slice(0, 400), "...");

      const sections = splitIntoSections(text);
      console.log("\n📑 PARSED RESUME SECTIONS:\n", Object.keys(sections));

      console.time("AIAnalysis");
      const analysis = await analyzeResume(text, sections);
      console.timeEnd("AIAnalysis");

      console.log("\n✅ FINAL AI ANALYSIS RESULT:\n", analysis);

      console.timeEnd("TotalResumeAnalysis");

      res.json({
        analysis,
        parsedResume: {
          rawText: text,
          sections,
        },
      });
    } catch (e) {
      console.error("❌ Server Error:", e.message);
      res.status(500).json({ error: e.message });
    } finally {
      if (file.filepath) {
        fs.unlink(file.filepath, (err) => {
          if (err) console.warn("Failed to delete temp resume file:", err.message);
        });
      }
    }
  });
});

module.exports = router;
