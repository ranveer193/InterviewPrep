const FILLER_WORDS = [
  "um", "uh", "like", "you know", "so", "actually", "basically", "literally", "i mean"
];

// Counts occurrences of each filler word
function countFillerWords(text) {
  const words = text.toLowerCase().split(/\s+/);
  return FILLER_WORDS.reduce((acc, filler) => {
    const count = words.filter(w => w === filler).length;
    if (count > 0) acc[filler] = count;
    return acc;
  }, {});
}

// Scores fluency based on filler word ratio
function getFluencyScore(text, fillerCounts) {
  const totalWords = text.trim().split(/\s+/).length;
  const fillerTotal = Object.values(fillerCounts).reduce((sum, val) => sum + val, 0);
  const ratio = fillerTotal / totalWords;

  if (ratio < 0.02) return "Excellent";
  if (ratio < 0.05) return "Good";
  if (ratio < 0.1) return "Average";
  return "Needs Improvement";
}

function analyzeTranscript(transcript) {
  if (!transcript || !transcript.trim()) return null;

  const fillerCounts = countFillerWords(transcript);
  const fluency = getFluencyScore(transcript, fillerCounts);
  const wordCount = transcript.trim().split(/\s+/).length;

  const pauseCount = (transcript.match(/(\.{2,}|-{2,}|—{2,})/g) || []).length;

  return {
    wordCount,
    fillerWords: fillerCounts,
    fluency,
    pauses: pauseCount,
  };
}

module.exports = analyzeTranscript;
