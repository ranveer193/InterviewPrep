const fs   = require("fs");
const MockInterview = require("../models/mockInterview");
const OAQuestion    = require("../models/OAQuestion");
const { getRandomElements } = require("../utils/random");
const { askLLM }            = require("../utils/openRouter");
const analyzeVoiceCoach = require("../utils/analyzeVoiceCoach");
const extractAudio          = require("../utils/extractAudio");
require("dotenv").config();

const WHISPER_SPACE = process.env.WHISPER_SPACE_URL;

/* ───────── create ───────── */
const createMockInterview = async (req, res) => {
  try {
    const userId = req.user?.uid || "anonymous";

    const pool = await OAQuestion.find({ approved: true });
    if (pool.length < 1) return res.status(400).json({ error: "No questions" });

    /* 👉 Decide number of questions here */
    const TOTAL_Q = 1;                           
    const picked  = getRandomElements(pool, TOTAL_Q).map((q) => ({
      text:           q.question,
      category:       q.topic || "General",
      transcription: "",
      summary:       "",
      rating:        null,
      analysis:      {},
    }));

    const doc = await MockInterview.create({
      userId,
      company: req.body.company || "General",
      questions: picked,
    });

    res.status(201).json({
      success: true,
      interviewId: doc._id,
      totalQ: TOTAL_Q,
      questions: picked.map(({ text, category }) => ({ text, category })),
    });
  } catch (err) {
    console.error("createMockInterview error:", err);
    res.status(500).json({ error: "Failed to create" });
  }
};

/* ───────── transcribe video ───────── */
const transcribeVideo = async (req, res) => {
   const ts = () => new Date().toISOString().split("T")[1].split(".")[0]; // hh:mm:ss
  try {
    const interviewId = req.params.id;
    const idx = req.body.index;
    const question = req.body.questionText;
    const videoPath = req.file?.path;
    if (!videoPath) return res.status(400).json({ error: "Video missing" });

    console.log(`[${ts()}] 🎬 file saved →`, videoPath);

    // 1. extract audio
    const audioPath = await extractAudio(videoPath);
    console.log(`[${ts()}] 🔊 audio extracted →`, audioPath);

    // 2. transcribe with Whisper
    console.log(`[${ts()}] 🤖 whisper request …`);
    const { Client, handle_file } = await import("@gradio/client");
    const whisper = await Client.connect(WHISPER_SPACE);
    const wRes = await whisper.predict("/predict", [handle_file(audioPath)]);
    const transcript = typeof wRes.data === "string" ? wRes.data : wRes.data?.[0];
    if (!transcript) throw new Error("Empty transcript");

    console.log(`[${ts()}] 📝 transcript OK (len=${transcript.length})`);
    console.log(`[${ts()}] 🔍 transcript value:`, transcript);

     /* ───── 3. delivery analysis (voice coach) ───── */
    const voiceCoach = analyzeVoiceCoach(transcript);   // fast, sync
    const coachSummary = voiceCoach.coachSummary;
    console.log(`[${ts()}] 🗣️  voice-coach →`, voiceCoach);

    // 4. generate summary + rating with improved prompt
    const prompt = `
      You are an AI assistant evaluating a mock-interview response.

      ——————————
      Question:
      ${question}

      Transcript of candidate’s answer:
      ${transcript}

      Interview Delivery Analysis:
      ${coachSummary}
      ——————————

      Please do **all** of the following:

      1. FIRST judge whether the answer is relevant to the question.
         • If it is mostly or completely unrelated, say:
          ❌ The answer is not relevant to the question.
         • If it is partially relevant, mention that clearly.

      2. Write a concise 3-5-line **Summary** of what the candidate actually said.

      3. Provide detailed **Feedback** covering:
         • Relevance (1–5)
         • Clarity   (1–5)
         • Completeness (1–5)
         • Concrete improvements

      4. Output a single **Rating** line at the end, calculated as the average of the three scores above, on a 0-5 scale (decimals allowed).

      Return your result in **exactly** this format:

      ---
      Summary:
      <your summary>

      Feedback:
      <your feedback – include the three subscores and suggestions>

      Rating:
      <NUMBER>/5
      ---

      “Rating:” must be the very last line. NUMBER must be between 0 and 5.
    `.trim();

    const raw = (await askLLM(prompt)) || "";
    console.log(`[${ts()}]  LLM raw output →\n${raw}\n`);

    // robust rating extractor
    const ratingMatch = raw.match(/Rating:\s*([0-5](?:\.\d+)?)(?=\s*\/\s*5)/i);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

    // everything above (including “Rating: …”) removed for the summary field
    const summary = raw.replace(/Rating:[\s\S]*/i, "").trim();

    console.log(`[${ts()}]  AI summary + rating parsed →`, rating);

    // 5. Save
    const payload = {
      [`questions.${idx}.transcription`]: transcript,
      [`questions.${idx}.summary`]      : summary,
      [`questions.${idx}.rating`]       : rating,
      [`questions.${idx}.analysis.voiceCoach`] : voiceCoach  
    };
    await MockInterview.findByIdAndUpdate(interviewId, { $set: payload });

    console.log(`[${ts()}] 💾 Mongo updated (q${idx})`);

    // 6. cleanup
    const KEEP_TEMP = process.env.KEEP_TEMP === "true";
    if (!KEEP_TEMP) {
      [audioPath, videoPath].forEach((p) => fs.existsSync(p) && fs.unlinkSync(p));
      console.log(`[${ts()}] 🧹 temp files deleted`);
    } else {
      console.log(`[${ts()}] 🗂 temp kept for debugging`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(`[${ts()}] ❌ transcribeVideo error:`, err);
    res.status(500).json({ error: "Transcription failed" });
  }
};

/* ───────── status array ───────── */
const getInterviewStatus = async (req, res) => {
  try {
    const iv = await MockInterview.findById(req.params.id);
    if (!iv) return res.status(404).json({ error: "Not found" });

    const statuses = iv.questions.map((q) =>
      q.transcription && q.summary ? "done"
      : q.transcription             ? "processing"
      : "idle"
    );

    res.json(statuses);          // plain array so hook consumes directly
  } catch (err) {
    console.error("getInterviewStatus error:", err);
    res.status(500).json({ error: "Status fetch failed" });
  }
};

/* ───────── result ───────── */
const getInterviewResult = async (req, res) => {
  try {
    const iv = await MockInterview.findById(req.params.id);
    if (!iv) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: iv });
  } catch (err) {
    console.error("getInterviewResult error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
};

/* ───────── analyze fallback (not commonly used) ───────── */
const analyzeTranscript = async (req, res) => {
  res.status(501).json({ error: "Deprecated" });
};

module.exports = {
  createMockInterview,
  transcribeVideo,
  getInterviewStatus,
  getInterviewResult,
  analyzeTranscript,
};
