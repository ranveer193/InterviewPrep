const { splitIntoSections } = require("./splitIntoSections");
const { chatCompletion } = require("../utils/aiProvider");

const CRITERIA_KEYS = ["clarity", "impact", "relevance"];

async function analyzeResume(text, preSplitSections = null) {
  const sections = preSplitSections || splitIntoSections(text);
  const entries = Object.entries(sections).filter(
    ([name]) => name !== "contact_info"
  );

  // If only contact_info or empty was found, include all entries
  const activeEntries = entries.length > 0 ? entries : Object.entries(sections);

  if (activeEntries.length === 0) {
    return [
      {
        section: "general",
        score: 0,
        criteria: { clarity: 0, impact: 0, relevance: 0 },
        suggestions: ["Could not identify resume sections"],
      },
    ];
  }

  // Short-circuit sections with too little content
  const shortSections = [];
  const validSections = [];

  for (const [name, content] of activeEntries) {
    if (!content || content.length < 25) {
      shortSections.push({
        section: name,
        score: 0,
        criteria: { clarity: 0, impact: 0, relevance: 0 },
        suggestions: ["Section too short or missing key details"],
      });
    } else {
      validSections.push([name, content]);
    }
  }

  if (validSections.length === 0) return shortSections;

  // Build a single batched prompt for all valid sections
  const sectionBlock = validSections
    .map(([name, content]) => `[${name.toUpperCase()}]\n${content.substring(0, 2500)}`)
    .join("\n\n---\n\n");

  const messages = [
    {
      role: "system",
      content:
        "You are an expert technical resume reviewer. You will be given multiple resume sections. " +
        "For EACH section, return a JSON object with keys: " +
        '"section" (lowercase section name matching the header provided), "score" (integer 0-10), ' +
        '"criteria" (object with integer scores 0-10 for clarity, impact, relevance), ' +
        '"suggestions" (array of 2-4 actionable, high-impact suggestions tailored to the section content). ' +
        "Return a valid JSON array of these objects only. No extra text, no markdown fences.",
    },
    {
      role: "user",
      content: `Evaluate each of the following resume sections:\n\n${sectionBlock}\n\nRespond with a JSON array only.`,
    },
  ];

  try {
    const raw = await chatCompletion(messages);
    console.log("[ResumeAnalyzer] RAW AI OUTPUT ➜", raw);

    // Strip markdown code fences if present
    let cleaned = raw;
    const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) cleaned = fenceMatch[1].trim();

    // Extract JSON array
    const arrStart = cleaned.indexOf("[");
    const arrEnd = cleaned.lastIndexOf("]");
    if (arrStart === -1 || arrEnd === -1) {
      throw new Error("No JSON array found in response");
    }
    const parsed = JSON.parse(cleaned.slice(arrStart, arrEnd + 1));

    const aiResults = parsed.map((item) => {
      const crit = {};
      CRITERIA_KEYS.forEach((k) => (crit[k] = Number(item.criteria?.[k]) || 0));
      return {
        section: String(item.section || "unknown").toLowerCase(),
        score: Number(item.score) || 0,
        criteria: crit,
        suggestions: Array.isArray(item.suggestions)
          ? item.suggestions
          : ["No suggestions returned"],
      };
    });

    return [...shortSections, ...aiResults];
  } catch (err) {
    console.error("[ResumeAnalyzer] Batch analysis failed:", err.message);
    // Fallback: return fallback scores for all sections
    const fallback = validSections.map(([name]) => ({
      section: name,
      score: 5,
      criteria: { clarity: 5, impact: 5, relevance: 5 },
      suggestions: [
        "Include quantifiable metrics and impact numbers.",
        "Highlight technologies and methodologies clearly.",
      ],
    }));
    return [...shortSections, ...fallback];
  }
}

module.exports = { analyzeResume };
