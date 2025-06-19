const express = require("express");
const { getCompanies, getQuestionsByCompany, bulkCreate } = require("../controllers/OaController.js");

const router = express.Router();

router.get("/companies", getCompanies);
router.get("/:company", getQuestionsByCompany);
router.post("/bulk", bulkCreate);    

module.exports = router;