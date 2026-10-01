/* utils/analyzeVoiceCoach.js */
const natural = require("natural");
const sbd = require("sbd");

/* ───── Config ───── */
const SINGLE_FILLERS = new Set([
  "um", "uh", "like", "so", "actually", "basically",
  "literally", "right", "well", "okay"
]);
const MULTI_FILLERS = ["you know", "i mean"];

const POSITIVE = ["confident", "excited", "innovative", "achieved", "successfully", "improved", "led"];
const NEGATIVE = ["worried", "difficult", "problem", "stress", "failed", "struggled"];

/* ───── Main Function ───── */
function analyzeVoiceCoach(transcript, audioDurationSeconds = null) {
  if (!transcript || !transcript.trim()) return null;

  const text = transcript.trim();
  const lowerText = text.toLowerCase();
  const words = lowerText
    .split(/\s+/)
    .map((w) => w.replace(/[.,!?;:"'(){}\[\]]/g, "").trim())
    .filter(Boolean);

  /* ---------- Totals ---------- */
  const totalWords = words.length;
  if (totalWords === 0) return null;

  const durationSeconds = audioDurationSeconds && audioDurationSeconds > 0
    ? audioDurationSeconds
    : totalWords / 2.3; // fallback ~140 WPM average
  const durationMinutes = Math.max(durationSeconds / 60, 0.1);

  /* ---------- Filler counts ---------- */
  const fillerCounts = {};
  let fillerTotal = 0;

  // Multi-word fillers
  MULTI_FILLERS.forEach((phrase) => {
    const re = new RegExp(`\\b${phrase}\\b`, "g");
    const matches = lowerText.match(re);
    if (matches) {
      fillerCounts[phrase] = matches.length;
      fillerTotal += matches.length;
    }
  });

  // Single-word fillers
  words.forEach((w) => {
    if (SINGLE_FILLERS.has(w)) {
      fillerCounts[w] = (fillerCounts[w] || 0) + 1;
      fillerTotal++;
    }
  });

  /* ---------- Pauses ---------- */
  const pauseCount = (transcript.match(/(\.{2,}|-{2,}|—{2,})/g) || []).length;

  /* ---------- Sentence variety ---------- */
  let sentences = [];
  try {
    sentences = sbd.sentences(text, { newline_boundaries: true });
  } catch (e) {
    sentences = [text];
  }
  const tokenizer = new natural.WordTokenizer();
  const sentenceLens = sentences.map((s) => {
    const tokens = tokenizer.tokenize(s);
    return tokens ? tokens.length : 0;
  }).filter((len) => len > 0);

  const avgLen = sentenceLens.length > 0
    ? sentenceLens.reduce((a, b) => a + b, 0) / sentenceLens.length
    : totalWords;
  const variance = sentenceLens.length > 0
    ? sentenceLens.reduce((a, b) => a + Math.pow(b - avgLen, 2), 0) / sentenceLens.length
    : 0;
  const sentenceVariety = Math.sqrt(variance);

  /* ---------- Tone ---------- */
  const posHits = POSITIVE.filter((w) => lowerText.includes(w)).length;
  const negHits = NEGATIVE.filter((w) => lowerText.includes(w)).length;
  const tone = posHits === negHits ? "neutral" : posHits > negHits ? "positive" : "cautious";

  /* ---------- WPM & Fluency ---------- */
  const wpm = totalWords / durationMinutes;
  const ratio = fillerTotal / totalWords;
  const fluency =
    ratio < 0.02 ? "Excellent" :
    ratio < 0.05 ? "Good" :
    ratio < 0.10 ? "Average" : "Needs Improvement";

  /* ---------- Suggestions ---------- */
  const suggestions = [];
  if (fillerTotal > 3) suggestions.push("Avoid filler words");
  if (pauseCount > 4) suggestions.push("Reduce long pauses");
  if (sentenceVariety < 4 && sentenceLens.length > 1) suggestions.push("Vary sentence lengths");
  if (wpm < 90) suggestions.push("Try speaking slightly faster");
  else if (wpm > 170) suggestions.push("Slow down slightly for clarity");
  if (tone === "cautious") suggestions.push("Use more confident, proactive phrasing");
  if (suggestions.length === 0) suggestions.push("Great pace, structure, and delivery!");

  /* ---------- Coach summary ---------- */
  const coachSummary = `
Interview Delivery Feedback:
• Speaking Speed: ${Math.round(wpm)} WPM
• Filler Words: ${fillerTotal}
• Sentence Variety: ${sentenceVariety.toFixed(1)}
• Tone: ${tone}
• Fluency: ${fluency}
• Suggestions: ${suggestions.join("; ")}
`.trim();

  return {
    totalWords,
    avgWordsPerMinute: Math.round(wpm),
    pauses: pauseCount,
    sentenceVariety: parseFloat(sentenceVariety.toFixed(2)),
    tone,
    fillerWords: { total: fillerTotal, breakdown: fillerCounts },
    fluency,
    suggestions,
    coachSummary,
  };
}

module.exports = analyzeVoiceCoach;
