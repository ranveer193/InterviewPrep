const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { createWorker } = require("tesseract.js");
const fetch = require("node-fetch");
const FormData = require("form-data");
const mime = require("mime-types");

async function preprocessResume(filePath) {
  const buf = fs.readFileSync(filePath);
  const mimeType = mime.lookup(filePath); // e.g., "application/pdf", "image/png"

  // 🧾 PDF parsing
  if (mimeType === "application/pdf") {
    try {
      const { text } = await pdfParse(buf);
      if (text && text.trim().length > 100) {
        console.log("✅ Extracted text from PDF via pdf-parse");
        return text;
      }
      console.warn("⚠️ PDF parsed but returned too little text.");
    } catch (err) {
      console.warn("❌ pdf-parse failed:", err.message);
    }
  }

  // 🖼 OCR for image files
  if (mimeType && mimeType.startsWith("image/")) {
    try {
      const worker = await createWorker("eng");
      const { data } = await worker.recognize(buf);
      await worker.terminate();

      if (data.text && data.text.trim().length > 100) {
        console.log("✅ Extracted text via Tesseract OCR");
        return data.text;
      }
      console.warn("⚠️ OCR returned too little text.");
    } catch (err) {
      console.warn("❌ Tesseract OCR failed:", err.message);
    }
  }

  // 🌐 Hugging Face OCR fallback
  if (process.env.HF_OCR_URL) {
    try {
      const form = new FormData();
      form.append("file", buf, path.basename(filePath));
      const r = await fetch(process.env.HF_OCR_URL, { method: "POST", body: form });
      const j = await r.json();

      if (j.text && j.text.trim().length > 100) {
        console.log("✅ Extracted via HuggingFace OCR fallback");
        return j.text;
      }
      console.warn("⚠️ HF fallback returned too little text.");
    } catch (err) {
      console.warn("❌ HF OCR fallback failed:", err.message);
    }
  }

  throw new Error("Unable to extract readable text from resume.");
}

module.exports = { preprocessResume };
