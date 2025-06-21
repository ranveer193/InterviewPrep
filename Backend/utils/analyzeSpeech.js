function analyzeSpeech(transcript, audioDurationSeconds = null) {
  if (!transcript) return null;

  // Split words, trim punctuation
  const words = transcript
    .split(/\s+/)
    .map((w) => w.toLowerCase().replace(/[.,!?;:"'(){}\[\]]/g, "").trim())
    .filter(Boolean);

  const totalWords = words.length;

  // Estimate duration if not provided (assuming 1.5 words/sec ~ 150 wpm)
  const durationSeconds = audioDurationSeconds ?? totalWords / 1.5;
  const durationMinutes = durationSeconds / 60;

  // Filler words to detect
  const fillerWords = new Set([
    "um",
    "uh",
    "like",
    "you know",
    "so",
    "actually",
    "basically",
    "right",
    "well",
    "okay",
  ]);

  let fillerCount = 0;
  let pauseCount = 0;

  words.forEach((word, i) => {
    // Count filler words
    if (fillerWords.has(word)) fillerCount++;

    // Detect pauses by punctuation sequences inside words (e.g. '...', '--')
    if (/[.\-]{2,}/.test(word)) pauseCount++;
  });

  // Calculate WPM
  const wpm = durationMinutes > 0 ? totalWords / durationMinutes : 0;

  // Construct feedback
  const feedbackParts = [];
  if (pauseCount > 5) feedbackParts.push("reduce long pauses");
  if (fillerCount > 5) feedbackParts.push("avoid filler words");
  if (wpm < 80) feedbackParts.push("speed up a bit");
  else if (wpm > 160) feedbackParts.push("slow down slightly");
  if (feedbackParts.length === 0) feedbackParts.push("keep up the great pace and clarity");

  const feedback = "Good effort! Try to " + feedbackParts.join(", ") + ".";

  return {
    pauses: pauseCount,
    fillerWords: fillerCount,
    avgWordsPerMinute: Math.round(wpm),
    feedback,
  };
}

module.exports = analyzeSpeech;
