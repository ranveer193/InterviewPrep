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

/* POST /api/oa/bulk  – one form submits multiple questions at once */
const bulkCreate = async (req, res) => {
  try {
    const { company, role, year, questions } = req.body;
    if (!company || !role || !year || !Array.isArray(questions) || !questions.length) {
      return res.status(400).json({ message: "Invalid payload." });
    }

    const docs = questions.map((q) => ({
      company,
      role,
      year,
      question:    q.question,
      options:     q.options?.filter(Boolean), // strip empty strings
      answer:      q.answer,
      explanation: q.explanation,
    }));

    const created = await OAQuestion.insertMany(docs);
    res.status(201).json({ inserted: created.length });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getCompanies,
  getQuestionsByCompany,
  bulkCreate,
};
