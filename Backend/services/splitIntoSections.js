const { SECTION_ALIASES } = require("./sectionAliases");

const PRIMARY_SECTIONS = new Set([
  "summary",
  "education",
  "experience",
  "projects",
  "skills",
  "certifications",
  "coursework",
  "leadership",
  "achievements",
  "publications",
]);

/**
 * Identify whether a line is a major resume section heading.
 */
function identifyHeader(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 55) return null;

  // Disqualify contact info, URLs, emails
  if (/@|https?:\/\/|www\.|\.com|\.org|\.in|\.net|github\.com|linkedin\.com/i.test(trimmed)) {
    return null;
  }

  // Disqualify dates (years, month names/abbreviations) - these belong inside projects or experience
  if (
    /(19|20)\d{2}|\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/i.test(
      trimmed
    )
  ) {
    return null;
  }

  // Disqualify bullet points, grades, phone numbers
  if (/^[•\-\*>\u2022\u25cf\u25cb]/.test(trimmed)) return null;
  if (/^(cgpa|gpa|percentage|phone|mobile|\+?\d{2,})/i.test(trimmed)) return null;

  // Clean decorators like '1.', '##', trailing colons, underlines
  const clean = trimmed
    .replace(/^[\d\.\-\s#|•\u2022\u25cf]+/, "")
    .replace(/[:\-_=|]+$/, "")
    .trim()
    .toLowerCase();

  if (!clean || clean.length < 2) return null;

  // Check aliases dictionary
  if (SECTION_ALIASES[clean]) {
    return SECTION_ALIASES[clean];
  }

  // Check primary sections
  if (PRIMARY_SECTIONS.has(clean)) {
    return clean;
  }

  return null;
}

/**
 * Splits extracted resume text into canonical, structured sections.
 * @param {string} text - Raw extracted text from PDF/OCR
 * @returns {Record<string, string>} - Object mapping canonical section names to their text content
 */
function splitIntoSections(text) {
  if (!text || typeof text !== "string") return {};

  const lines = text.split(/\r?\n/);
  const sections = {};
  let currentSection = "contact_info";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const matchedHeader = identifyHeader(trimmed);
    if (matchedHeader) {
      currentSection = matchedHeader;
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
    } else {
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
      sections[currentSection].push(trimmed);
    }
  }

  const out = {};
  for (const [key, lineArr] of Object.entries(sections)) {
    const content = lineArr.join("\n").trim();
    if (content) {
      out[key] = content;
    }
  }

  // Fallback: If no standard sections were recognized, provide a general section
  const substantiveKeys = Object.keys(out).filter((k) => k !== "contact_info");
  if (substantiveKeys.length === 0 && text.trim().length > 0) {
    out["general"] = text.trim();
  }

  return out;
}

module.exports = { splitIntoSections };
