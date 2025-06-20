const express = require("express");
const { approveQuestion, getAll,getCompanies, getQuestionsByCompany, bulkCreate } = require("../controllers/OaController.js");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();

router.get("/all", verifyAdmin, getAll);
router.get("/companies", getCompanies);
router.post("/bulk", bulkCreate);  
router.get("/:company", getQuestionsByCompany);
router.patch("/:id/:action", verifyAdmin, approveQuestion);

module.exports = router;