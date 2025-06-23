const OAQuestion = require("../models/OAQuestion");

/* GET /oa/companies
   → ["Adobe","Amazon",…]  */
const getCompanies = async (req, res) => {
  try {
    const { difficulty } = req.query; 
    const match = { approved: true };
    if (["Easy","Medium","Hard"].includes(difficulty)) {
      match.difficulty = difficulty;
    }
    const companies = await OAQuestion.distinct("company", match);
    res.json(companies.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET  /oa/:company?difficulty=Hard
   -> [{ year, role, question, detail, difficulty }, …] */
const getQuestionsByCompany = async (req, res) => {
  try {
    const company    = decodeURIComponent(req.params.company);
    const { difficulty } = req.query;

    const match = { company, approved: true };
    if (["Easy","Medium","Hard"].includes(difficulty)) {
      match.difficulty = difficulty;
    }

    const questions = await OAQuestion.find(match)
      .select("year role question detail difficulty -_id")
      .sort({ year: -1 })
      .exec();

    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* POST /oa/bulk — store difficulty already present in req.body.questions */
const bulkCreate = async (req, res) => {
  try {
    const { company, role, year, questions } = req.body;

    // Validate request
    if (!company || !role || !year || !Array.isArray(questions) || !questions.length) {
      return res.status(400).json({ message: "Invalid payload." });
    }

    console.log("📩 Received questions for:", company, role, year);
    console.log("🧮 Total questions received:", questions.length);

    // Prepare documents
    const docs = questions.map((q, i) => {
      console.log(`📄 Q${i + 1} difficulty:`, q.difficulty);
      return {
        company,
        role,
        year,
        question: q.question,
        options: q.options?.filter(Boolean),
        answer: q.answer,
        explanation: q.explanation,
        difficulty: q.difficulty || null,
      };
    });

    // Insert to MongoDB
    const created = await OAQuestion.insertMany(docs);
    console.log("✅ Inserted count:", created.length);

    res.status(201).json({ inserted: created.length });
  } catch (err) {
    console.error("❌ Bulk insert failed:", err);
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
