const { askLLM } = require("../utils/openRouter.js");

const classifyDifficulty = async function(req, res) {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "question required" });

  const prompt = `
Classify the following coding or aptitude question as exactly one word:
Easy, Medium, or Hard.

Question:
${question}
  `.trim();

  const raw = (await askLLM(prompt)) || "Medium";
  const difficulty =
    /hard/i.test(raw)   ? "Hard"   :
    /medium|med/i.test(raw) ? "Medium" : "Easy";

  res.json({ difficulty });
}

/* ---------- Summarization ---------- */
const summarizeContent = async function(req, res) {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "content required" });

  const prompt = `
Summarize the following interview experience in <= 120 words
while keeping key challenges and results:

${content}
  `.trim();

  const summary = await askLLM(prompt);
  res.json({ summary });
}

module.exports = {
  classifyDifficulty,
  summarizeContent,
};
