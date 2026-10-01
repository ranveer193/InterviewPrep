const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const DEEPGRAM_API_KEY =
  process.env.DEEPGRAM_API_KEY || "dc1e6707b6faf48c7906943270c9b699c9bec0c8";
const WHISPER_SPACE = process.env.WHISPER_SPACE_URL;

async function transcribeWithDeepgram(audioFilePath) {
  if (!DEEPGRAM_API_KEY) {
    throw new Error("No Deepgram API key configured");
  }

  const audioBuffer = await fs.promises.readFile(audioFilePath);
  const isWebm = audioFilePath.endsWith(".webm");
  const contentType = isWebm ? "audio/webm" : "audio/mp3";
  const model = process.env.DEEPGRAM_MODEL || "nova-2";

  const response = await axios.post(
    `https://api.deepgram.com/v1/listen?model=${model}&smart_format=true&punctuate=true`,
    audioBuffer,
    {
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": contentType,
      },
      timeout: 20000,
    }
  );

  const transcript =
    response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
  return transcript.trim();
}

async function transcribeWithWhisper(audioFilePath) {
  if (!WHISPER_SPACE) throw new Error("No Whisper space URL configured");
  const { Client } = await import("@gradio/client");
  const whisper = await Client.connect(WHISPER_SPACE);

  const buffer = await fs.promises.readFile(audioFilePath);
  const audioBlob = new Blob([buffer], {
    type: audioFilePath.endsWith(".mp3") ? "audio/mp3" : "audio/wav",
  });

  const wRes = await whisper.predict("/predict", {
    audio_file: audioBlob,
  });

  const transcript =
    typeof wRes.data === "string"
      ? wRes.data
      : Array.isArray(wRes.data)
      ? wRes.data[0]
      : wRes.data?.transcript || "";
  return (transcript || "").trim();
}

/**
 * Transcribe audio using Deepgram -> fallback Whisper -> fallback browser transcript
 */
async function transcribeAudioPipeline(audioFilePath, browserTranscript = "") {
  let transcript = "";

  // 1. Primary: Deepgram
  try {
    console.log("⚡ Attempting speech-to-text with Deepgram...");
    transcript = await transcribeWithDeepgram(audioFilePath);
    if (transcript) {
      console.log(`✅ Deepgram transcribed successfully (${transcript.length} chars)`);
      return transcript;
    }
  } catch (err) {
    console.warn("⚠️ Deepgram transcription error, falling back to Whisper:", err.response?.data?.message || err.message);
  }

  // 2. Fallback 1: Whisper Hugging Face
  try {
    console.log("🔄 Attempting Whisper STT fallback...");
    transcript = await transcribeWithWhisper(audioFilePath);
    if (transcript) {
      console.log(`✅ Whisper transcribed successfully (${transcript.length} chars)`);
      return transcript;
    }
  } catch (err) {
    console.warn("⚠️ Whisper HF space error, falling back to browser transcript:", err.message);
  }

  // 3. Fallback 2: Browser Speech Recognition
  if (browserTranscript && browserTranscript.trim()) {
    console.log("🌐 Using Browser SpeechRecognition transcript fallback");
    return browserTranscript.trim();
  }

  // 4. Default fallback message if no transcription succeeded
  console.warn("⚠️ All transcription methods failed; using fallback evaluation message.");
  return "Audio recorded successfully. Evaluation based on response timing and metadata.";
}

module.exports = {
  transcribeAudioPipeline,
  transcribeWithDeepgram,
  transcribeWithWhisper,
};
