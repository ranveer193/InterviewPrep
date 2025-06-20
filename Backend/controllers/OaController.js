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
    const questions = await OAQuestion.find({ company , approved: true })
      .select("year role question detail -_id")
      .sort({ year: -1 })
      .exec();

    res.json(questions);                   
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

const getAll = async (req, res) => {
  const data = await OAQuestion.find({});
  res.json(data);
}

const approveQuestion = async (req, res) => {
  const { id, action } = req.params;

  if (action === "approve" || action === "reject") {
    try {
      if (action === "approve") {
        await OAQuestion.findByIdAndUpdate(id, { approved: true });
        res.json({ message: "OA Question approved successfully." });
      } else {
        await OAQuestion.findByIdAndDelete(id);
        res.json({ message: "OA Question rejected and deleted." });
      }
    } catch (err) {
      console.error("Admin action failed:", err);
      res.status(500).json({ error: "Server error during approval/rejection." });
    }
  } else {
    res.status(400).json({ error: "Invalid action." });
  }
};

module.exports = {
  getCompanies,
  getQuestionsByCompany,
  bulkCreate,
  getAll,
  approveQuestion,
};
