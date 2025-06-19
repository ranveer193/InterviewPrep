const OAQuestion = require("../models/OAQuestion");

/* GET /oa/companies
   → ["Adobe","Amazon",…]  */
const getCompanies = async (_req, res) => {
  try {
    const companies = await OAQuestion.distinct("company");
    res.json(companies.sort());            // ✅ pure array
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET /oa/:company
   → [{ year, role, question, detail }, …] */
const getQuestionsByCompany = async (req, res) => {
  try {
    const company   = decodeURIComponent(req.params.company);
    const questions = await OAQuestion.find({ company })
      .select("year role question detail -_id")
      .sort({ year: -1 })
      .exec();

    res.json(questions);                   // ✅ always array
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* POST /oa  (admin / seed) */
const createQuestion = async (req, res) => {
  try {
    const newQ = await OAQuestion.create(req.body);
    res.status(201).json(newQ);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getCompanies,
  getQuestionsByCompany,
  createQuestion,
};
