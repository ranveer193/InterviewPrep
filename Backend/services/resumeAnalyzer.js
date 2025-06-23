const { splitIntoSections } = require("./splitIntoSections");
const { chatCompletion } = require("./aiClient");

async function analyzeResume(text) {
  const sections = splitIntoSections(text);
  const CRITERIA_KEYS = ["clarity", "impact", "relevance"];

  const jobs = Object.entries(sections).map(async ([name, content]) => {
    if (!content || content.length < 30) {
      return {
        section: name,
        score: 0,
        criteria: { clarity: 0, impact: 0, relevance: 0 },
        suggestions: ["Section too short"],
      };
    }

    const messages = [
      {
        role: "system",
        content:
          "You are a professional resume reviewer. Return ONLY valid JSON with keys: " +
          '"score" (0-10), "criteria" (object with clarity, impact, relevance 0-10), ' +
          '"suggestions" (string array). No extra text.',
      },
      {
        role: "user",
        content: `Evaluate the following ${name.toUpperCase()} section:\n\n${content.substring(
          0,
          3000
        )}\n\nRespond strictly in JSON.`,
      },
    ];

    try {
      const raw = await chatCompletion(messages);
      console.log(`RAW AI OUTPUT [${name}] ➜`, raw);

      // safely extract first JSON block
      const json = JSON.parse(
        raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)
      );

      // normalize criteria object
      const crit = {};
      CRITERIA_KEYS.forEach(
        (k) => (crit[k] = Number(json.criteria?.[k]) || 0)
      );

      return {
        section: name,
        score: Number(json.score) || 0,
        criteria: crit,
        suggestions: Array.isArray(json.suggestions)
          ? json.suggestions
          : ["No suggestions returned"],
      };
    } catch (err) {
      console.error(`Parse fail [${name}]:`, err.message);
      return {
        section: name,
        score: 0,
        criteria: { clarity: 0, impact: 0, relevance: 0 },
        suggestions: ["AI response malformed"],
      };
    }
  });

  return Promise.all(jobs);
}

module.exports = { analyzeResume };
