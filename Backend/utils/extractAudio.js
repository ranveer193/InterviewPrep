const path = require("path");
const fs = require("fs");
const ffmpegPath = require("ffmpeg-static");

async function extractAudio(videoPath) {
  const { execa } = await import("execa"); // ✅ dynamic import works in CommonJS
  const audioPath = videoPath.replace(/\.\w+$/, ".mp3");

  console.log("🎬 Extracting audio from video...");
  console.log("📹 Video:", videoPath);
  console.log("🎧 Output MP3:", audioPath);
  console.log("🛠 FFmpeg path:", ffmpegPath);

  try {
    await execa(ffmpegPath, [
      "-i", videoPath,
      "-vn",
      "-acodec", "libmp3lame",
      audioPath,
    ]);
    console.log("✅ Audio extracted successfully.");
    return audioPath;
  } catch (err) {
    console.error("❌ FFmpeg extraction failed:", err.message);
    throw err;
  }
}

module.exports = extractAudio;
