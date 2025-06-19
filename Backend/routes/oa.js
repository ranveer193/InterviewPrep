const express = require("express");
const { getCompanies, getQuestionsByCompany, createQuestion } = require("../controllers/OaController.js");

const router = express.Router();

router.get("/companies", getCompanies);
router.get("/:company", getQuestionsByCompany);
router.post("/", createQuestion);         

module.exports = router;