/* utils/analyzeVoiceCoach.js */
// npm i natural sbd
const natural = require("natural");
const sbd     = require("sbd");

/* ───── Config ───── */
const FILLERS = new Set([
  "um", "uh", "like", "you know", "so", "actually", "basically",
  "literally", "i mean", "right", "well", "okay"
]);
const POSITIVE = ["confident", "excited", "innovative", "achieved"];
const NEGATIVE = ["worried", "difficult", "problem", "stress"];

/* ───── Main Function ───── */
function analyzeVoiceCoach(transcript, audioDurationSeconds = null) {
  if (!transcript || !transcript.trim()) return null;

  const text  = transcript.trim();
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.replace(/[.,!?;:"'(){}\[\]]/g, "").trim())
    .filter(Boolean);

  /* ---------- Totals ---------- */
  const totalWords      = words.length;
  const durationSeconds = audioDurationSeconds ?? totalWords / 1.5; // ≈150 wpm
  const durationMinutes = durationSeconds / 60;

  /* ---------- Filler counts ---------- */
  const fillerCounts = {};
  let fillerTotal = 0;
  words.forEach(w => {
    if (FILLERS.has(w)) {
      fillerCounts[w] = (fillerCounts[w] || 0) + 1;
      fillerTotal++;
    }
  });

  /* ---------- Pauses ---------- */
  const pauseCount = (transcript.match(/(\.{2,}|-{2,}|—{2,})/g) || []).length;

  /* ---------- Sentence variety ---------- */
  const sentences = sbd.sentences(text, { newline_boundaries: true });
  const tokenizer = new natural.WordTokenizer();           // ✅ use `new`
  const sentenceLens = sentences.map(s =>
    tokenizer.tokenize(s).length
  );
  const avgLen   = sentenceLens.reduce((a,b) => a+b, 0) / (sentenceLens.length || 1);
  const variance = sentenceLens.reduce(
    (a,b) => a + Math.pow(b - avgLen, 2),
    0
  ) / (sentenceLens.length || 1);
  const sentenceVariety = Math.sqrt(variance);

  /* ---------- Tone ---------- */
  const lc      = text.toLowerCase();
  const posHits = POSITIVE.filter(w => lc.includes(w)).length;
  const negHits = NEGATIVE.filter(w => lc.includes(w)).length;
  const tone    = posHits === negHits ? "neutral" : posHits > negHits ? "positive" : "cautious";

  /* ---------- WPM & Fluency ---------- */
  const wpm   = durationMinutes > 0 ? totalWords / durationMinutes : 0;
  const ratio = fillerTotal / totalWords;
  const fluency =
    ratio < 0.02 ? "Excellent" :
    ratio < 0.05 ? "Good"      :
    ratio < 0.10 ? "Average"   : "Needs Improvement";

  /* ---------- Suggestions ---------- */
  const suggestions = [];
  if (fillerTotal > 5)        suggestions.push("Avoid filler words");
  if (pauseCount  > 5)        suggestions.push("Reduce long pauses");
  if (sentenceVariety < 5)    suggestions.push("Vary sentence lengths");
  if (wpm < 80)               suggestions.push("Try speaking faster");
  else if (wpm > 160)         suggestions.push("Slow down slightly");
  if (tone === "cautious")    suggestions.push("Use more confident language");
  if (!suggestions.length)    suggestions.push("Great pace and clarity!");

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
    coachSummary
  };
}

module.exports = analyzeVoiceCoach;
