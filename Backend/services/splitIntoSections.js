const { SECTION_ALIASES } = require("./sectionAliases");

function splitIntoSections(text) {
  const out = {};
  const re = /\n?([A-Z][A-Za-z ]{2,40})\s*[:\-]?\n([\s\S]*?)(?=\n[A-Z][A-Za-z ]{2,40}\s*[:\-]?\n|$)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const hdr = m[1].trim().toLowerCase();
    const canon = SECTION_ALIASES[hdr] || hdr;
    out[canon] = (out[canon] ? out[canon] + "\n\n" : "") + m[2].trim();
  }
  return out;
}

module.exports = { splitIntoSections };
