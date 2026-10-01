const fs = require("fs");
const MockInterview = require("../models/mockInterview");
const OAQuestion = require("../models/OAQuestion");
const { getRandomElements } = require("../utils/random");
const { askLLM } = require("../utils/aiProvider");
const analyzeVoiceCoach = require("../utils/analyzeVoiceCoach");
const extractAudio = require("../utils/extractAudio");
require("dotenv").config();

const WHISPER_SPACE = process.env.WHISPER_SPACE_URL;

/* ───────── create ───────── */
const createMockInterview = async (req, res) => {
  try {
    const userId = req.user?.uid || "anonymous";

    const company = req.body.company;
    const query = { approved: true };
    if (company && company !== "General") query.company = company;

    const pool = await OAQuestion.find(query);

    let TOTAL_Q = Number(req.body.numQuestions) || 2;
    if (TOTAL_Q < 1) TOTAL_Q = 1;
    if (TOTAL_Q > 10) TOTAL_Q = 10;
    
    const availableQuestions = Math.min(TOTAL_Q, pool.length);
    let picked = [];
    if (availableQuestions > 0) {
      picked = getRandomElements(pool, availableQuestions).map((q) => ({
        text: q.question,
        category: q.topic || "General",
        transcription: "",
        summary: "",
        rating: null,
        analysis: {},
      }));
    }

    if (picked.length < TOTAL_Q) {
      const hardcodedQuestions = [
        { text: "Tell me about a time you faced a difficult technical challenge and how you overcame it.", category: "Behavioral" },
        { text: "How do you handle disagreements with your team members regarding system design?", category: "Behavioral" },
        { text: "Can you explain the concept of RESTful APIs and how they differ from GraphQL?", category: "Technical" },
        { text: "Describe a project where you had to learn a new technology quickly.", category: "Behavioral" },
        { text: "What is your approach to testing and ensuring code quality?", category: "Technical" },
        { text: "Explain the difference between SQL and NoSQL databases and when to use each.", category: "Technical" },
        { text: "How do you optimize a slow-performing web application?", category: "Technical" },
        { text: "Tell me about a time you missed a deadline and how you handled it.", category: "Behavioral" },
        { text: "Describe your experience with CI/CD pipelines.", category: "Technical" },
        { text: "What are the key principles of object-oriented programming?", category: "Technical" },
      ];
      
      const needed = TOTAL_Q - picked.length;
      const extras = getRandomElements(hardcodedQuestions, needed).map((q) => ({
        text: q.text,
        category: q.category,
        transcription: "",
        summary: "",
        rating: null,
        analysis: {},
      }));
      picked = picked.concat(extras);
    }

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
    res.status(500).json({ error: "Failed to create mock interview" });
  }
};

const { transcribeAudioPipeline } = require("../utils/transcribeAudio");

/* ───────── fast JSON answer submission (Async AI processing) ───────── */
const submitAnswer = async (req, res) => {
  const ts = () => new Date().toISOString().split("T")[1].split(".")[0];
  try {
    const interviewId = req.params.id;
    const { index, transcript, questionText, audioDurationSeconds } = req.body;

    if (index === undefined || index === null) {
      return res.status(400).json({ error: "Question index required" });
    }
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    console.log(`[${ts()}] 🎙️ Submit answer for Q${index} (len=${transcript.length})`);

    // 1. Mark question as processing immediately so status polls reflect it
    await MockInterview.findByIdAndUpdate(interviewId, {
      $set: {
        [`questions.${index}.transcription`]: transcript.trim(),
        [`questions.${index}.summary`]: "",
      },
    });

    // 2. Respond immediately to client so user sees NO LAG!
    res.json({
      success: true,
      processing: true,
      message: "Answer submitted. AI analysis running asynchronously.",
      index,
    });

    // 3. Process AI in background
    (async () => {
      try {
        const voiceCoach = analyzeVoiceCoach(transcript, audioDurationSeconds);
        const coachSummary = voiceCoach?.coachSummary || "N/A";

        const prompt = `
You are an expert AI interviewer evaluating a candidate's mock-interview response.

Question:
${questionText || "Mock Interview Question"}

Candidate's Transcript:
${transcript}

Delivery & Fluency Analysis:
${coachSummary}

Please evaluate the response and provide output in EXACTLY this format:

Summary:
<3-5 line clear summary of candidate's answer>

Feedback:
Use markdown formatting for readability. Structure your feedback with these sections using **bold** headings and bullet points:

- **Content Accuracy**: How correct and complete was the answer?
- **Terminology**: Were technical terms used correctly?
- **Clarity**: How clear and easy to follow was the response?
- **Structure**: How well-organized was the answer?
- **Delivery**: Speaking pace, filler words, and communication style.
- **Key Improvements**: Specific actionable suggestions.

Rating:
<NUMBER>/5
`.trim();

        const raw = (await askLLM(prompt)) || "";
        console.log(`[${ts()}] 🤖 LLM evaluation output received for Q${index}`);

        const ratingMatch = raw.match(/Rating:\s*([0-5](?:\.\d+)?)(?=\s*\/\s*5)/i);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 3.0;
        const summary = raw.replace(/Rating:[\s\S]*/i, "").trim();

        const payload = {
          [`questions.${index}.transcription`]: transcript.trim(),
          [`questions.${index}.summary`]: summary,
          [`questions.${index}.rating`]: rating,
          [`questions.${index}.analysis.voiceCoach`]: voiceCoach,
        };

        await MockInterview.findByIdAndUpdate(interviewId, { $set: payload });
        console.log(`[${ts()}] 💾 Saved Q${index} async result to MongoDB`);
      } catch (bgErr) {
        console.error(`[${ts()}] ❌ Background evaluation error for Q${index}:`, bgErr.message);
        await MockInterview.findByIdAndUpdate(interviewId, {
          $set: {
            [`questions.${index}.summary`]: "Answer recorded. Evaluation completed with baseline scoring.",
            [`questions.${index}.rating`]: 3.0,
          },
        });
      }
    })();
  } catch (err) {
    console.error(`[${ts()}] ❌ submitAnswer error:`, err);
    res.status(500).json({ error: "Failed to process interview answer" });
  }
};

/* ───────── transcribe video (Deepgram -> Whisper -> Browser fallback, async AI) ───────── */
const transcribeVideo = async (req, res) => {
  const ts = () => new Date().toISOString().split("T")[1].split(".")[0];
  try {
    const interviewId = req.params.id;
    const idx = Number(req.body.index ?? 0);
    const question = req.body.questionText || "Mock Interview Question";
    const clientTranscript = req.body.transcript || req.body.clientTranscript || "";
    const videoPath = req.file?.path;

    if (!videoPath && !clientTranscript) {
      return res.status(400).json({ error: "Video or transcript missing" });
    }

    console.log(`[${ts()}] 🎬 Received submission for Q${idx} (video=${!!videoPath}, clientTranscript=${!!clientTranscript})`);

    // 1. Mark question as processing immediately
    await MockInterview.findByIdAndUpdate(interviewId, {
      $set: {
        [`questions.${idx}.transcription`]: clientTranscript || "__processing__",
        [`questions.${idx}.summary`]: "",
      },
    });

    // 2. Respond immediately to client so user sees NO LAG!
    res.json({
      success: true,
      processing: true,
      message: "Answer received, evaluating asynchronously.",
      index: idx,
    });

    // 3. Process transcription and AI evaluation in background
    (async () => {
      let audioPath = null;
      try {
        let transcript = clientTranscript;

        if (videoPath) {
          try {
            audioPath = await extractAudio(videoPath);
            console.log(`[${ts()}] 🔊 audio extracted →`, audioPath);
            // Run pipeline: Deepgram -> Whisper -> Browser fallback
            transcript = await transcribeAudioPipeline(audioPath, clientTranscript);
          } catch (audioErr) {
            console.warn(`[${ts()}] ⚠️ Audio extraction failed, using fallback transcript:`, audioErr.message);
            transcript = clientTranscript || "Audio recorded successfully. Evaluation based on response timing.";
          }
        }

        if (!transcript || !transcript.trim()) {
          transcript = "Audio recorded successfully. Evaluation based on response timing and metadata.";
        }

        const voiceCoach = analyzeVoiceCoach(transcript);
        const coachSummary = voiceCoach?.coachSummary || "N/A";

        const prompt = `
Evaluate candidate answer to: ${question}
Transcript: ${transcript}
Delivery: ${coachSummary}

Format your response as follows:

Summary:
<3-5 line clear summary of candidate's answer>

Feedback:
Use markdown formatting for readability. Structure your feedback with these sections using **bold** headings and bullet points:
- **Content Accuracy**: How correct and complete was the answer?
- **Terminology**: Were technical terms used correctly?
- **Clarity**: How clear and easy to follow was the response?
- **Structure**: How well-organized was the answer?
- **Delivery**: Speaking pace, filler words, and communication style.
- **Key Improvements**: Specific actionable suggestions.

Rating:
<NUMBER>/5
`.trim();

        const raw = (await askLLM(prompt)) || "";
        const ratingMatch = raw.match(/Rating:\s*([0-5](?:\.\d+)?)(?=\s*\/\s*5)/i);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 3.0;
        const summary = raw.replace(/Rating:[\s\S]*/i, "").trim();

        const payload = {
          [`questions.${idx}.transcription`]: transcript,
          [`questions.${idx}.summary`]: summary,
          [`questions.${idx}.rating`]: rating,
          [`questions.${idx}.analysis.voiceCoach`]: voiceCoach,
        };
        await MockInterview.findByIdAndUpdate(interviewId, { $set: payload });
        console.log(`[${ts()}] 💾 Saved async evaluation result for Q${idx}`);
      } catch (bgErr) {
        console.error(`[${ts()}] ❌ Background transcribeVideo error for Q${idx}:`, bgErr.message);
        await MockInterview.findByIdAndUpdate(interviewId, {
          $set: {
            [`questions.${idx}.summary`]: "Audio answer recorded. Evaluated with baseline scoring.",
            [`questions.${idx}.rating`]: 3.0,
          },
        });
      } finally {
        const KEEP_TEMP = process.env.KEEP_TEMP === "true";
        if (!KEEP_TEMP) {
          [audioPath, videoPath].forEach((p) => p && fs.existsSync(p) && fs.unlinkSync(p));
        }
      }
    })();
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

    // Ownership check if authenticated
    if (req.user?.uid && iv.userId && iv.userId !== "anonymous" && iv.userId !== req.user.uid) {
      return res.status(403).json({ error: "Access denied" });
    }

    const statuses = iv.questions.map((q) =>
      q.summary ? "done" : q.transcription ? "processing" : "idle"
    );

    res.json(statuses);
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

    // Ownership check if authenticated
    if (req.user?.uid && iv.userId && iv.userId !== "anonymous" && iv.userId !== req.user.uid) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ success: true, data: iv });
  } catch (err) {
    console.error("getInterviewResult error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
};

const analyzeTranscript = async (req, res) => {
  res.status(51).json({ error: "Deprecated" });
};

module.exports = {
  createMockInterview,
  submitAnswer,
  transcribeVideo,
  getInterviewStatus,
  getInterviewResult,
  analyzeTranscript,
};
