// Backward-compatible wrapper — delegates to the unified aiProvider
const { askLLM } = require("./aiProvider");
module.exports = { askLLM };
