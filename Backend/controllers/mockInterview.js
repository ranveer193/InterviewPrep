const fs         = require("fs");
const path       = require("path");
const axios      = require("axios");
const FormData   = require("form-data");

const MockInterview = require("../models/mockInterview.js");
const OAQuestion    = require("../models/OAQuestion.js");
const { getRandomElements } = require("../utils/random.js");
const analyzeTranscriptUtil     = require("../utils/analyzeTranscript.js");  
const analyzeSpeech = require("../utils/analyzeSpeech");

const getInterviewResult = async (req, res) => {
  try {
    const interviewId = req.params.id;

    const interview = await MockInterview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ error: "Mock interview not found" });
    }

    res.json({
      success: true,
      data: {
        questions: interview.questions,
        transcription: interview.transcription,
        analysis: interview.analysis,
        createdAt: interview.createdAt,
        videoUrl: interview.videoUrl, // if frontend needs it
      },
    });
  } catch (err) {
    console.error("Fetch Result Error:", err.message);
    res.status(500).json({ error: "Failed to fetch interview result" });
  }
};

const analyzeTranscript = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const interview = await MockInterview.findById(interviewId);

    if (!interview || !interview.transcription) {
      return res.status(404).json({ error: "Transcript not found for this interview." });
    }

    const analysis = analyzeSpeech(interview.transcription);

    const updated = await MockInterview.findByIdAndUpdate(
      interviewId,
      { analysis },
      { new: true }
    );

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (err) {
    console.error("Analysis Error:", err.message);
    res.status(500).json({ error: "Failed to analyze transcript" });
  }
};

/* ───────────────────────────── 1) CREATE  ───────────────────────────── */
const createMockInterview = async (req, res) => {
  try {
    const userId       = req.user?.uid || "anonymous";
    const allQuestions = await OAQuestion.find({ approved: true });

    if (allQuestions.length < 2)
      return res.status(400).json({ error: "Not enough questions in the DB." });

    // pick 2 random OA questions
    const selected = getRandomElements(allQuestions, 2).map((q) => ({
      text: q.question,
      category: q.topic || "General",
    }));

    const newInterview = await MockInterview.create({
      userId,
      questions: selected,
    });

    res.status(201).json({
      success: true,
      interviewId: newInterview._id,
      questions:  selected,
    });
  } catch (err) {
    console.error("MockInterview Error:", err);
    res.status(500).json({ error: "Failed to create mock interview" });
  }
};

/* ─────────────────────────── 2) TRANSCRIBE  ─────────────────────────── */
const transcribeVideo = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const filePath    = req.file?.path;             // set by multer

    if (!filePath)
      return res.status(400).json({ error: "Video file not found" });

    /* ---- call Whisper Space ---- */
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const whisperURL = "https://huggingface.co/spaces/Ranbirz1/Ranbirz1-mock-interview-whisper";

    const response = await axios.post(whisperURL, form, {
      headers: { ...form.getHeaders() },
      timeout: 120_000, // 2 min
    });

    const transcript = response.data?.text || response.data?.transcription;
    if (!transcript)
      return res.status(500).json({ error: "Transcription failed" });

    /* ---- 🧠 Run Step‑7 speech analysis ---- */
    const analysis = analyzeTranscriptUtil(transcript);   // { wordCount, fillerWords, fluency }

    /* ---- save to DB ---- */
    const updated = await MockInterview.findByIdAndUpdate(
      interviewId,
      { $set: { transcription: transcript, analysis } },
      { new: true }
    );

    /* ---- clean‑up local video ---- */
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      transcription: transcript,
      analysis,
    });
  } catch (err) {
    console.error("Transcription Error:", err);
    res.status(500).json({ error: "Failed to transcribe video" });
  }
};

module.exports = {
  createMockInterview,
  transcribeVideo,
  analyzeTranscript,
  getInterviewResult, 
};
