const express = require("express");
const { classifyDifficulty, summarizeContent } = require("../controllers/aiController");

const router = express.Router();

router.post("/classify",  classifyDifficulty); // POST /ai/classify
router.post("/summarize", summarizeContent);   // POST /ai/summarize

module.exports = router;
