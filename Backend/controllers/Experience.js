// controllers/experienceController.js
const Experience = require("../models/Experience");
const { askLLM } = require("../utils/openRouter"); // adjust path if needed

/* ─────────────────────────── GET ALL ─────────────────────────── */
const getAll = async (_req, res) => {
  const data = await Experience.find({});
  res.json(data);
};

/* ──────────────────────── GET SINGLE DOC ─────────────────────── */
const getExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const exp = await Experience.findById(id);
    if (!exp) return res.status(404).json({ error: "Experience not found" });
    res.json(exp);
  } catch (err) {
    console.error("Retrieval error:", err);
    res.status(500).json({ error: "Server error during retrieval" });
  }
};

/* ────────────────────────── AI SUMMARY ───────────────────────── */
async function getSummary(text = "") {
  if (!text.trim()) return "";
  const prompt = `Summarize the following interview experience in 3–4 concise bullet points:\n\n${text}`;
  const summary = await askLLM(prompt);
  return summary || "";
}

/* ─────────────────────── SUBMIT EXPERIENCE ───────────────────── */
const submitExperience = async (req, res) => {
  try {
    const { anonymous, content = "", ...data } = req.body;

    // strip PII if anonymous
    if (anonymous) {
      data.name = "Anonymous";
      data.email = undefined;
      data.linkedin = undefined;
    }

    // attach Firebase UID if available
    if (!anonymous && req.user?.uid) {
      data.submittedBy = req.user.uid;
    }

    // 🧠 Generate summary via OpenRouter
    console.log("[AI] Generating summary for content:\n", content); // 👈 Log input
    const summary = await getSummary(content);
    console.log("[AI] Summary generated:\n", summary); // 👈 Log output

    const newExp = new Experience({
      ...data,
      content,
      summary,
      anonymous: !!anonymous,
    });

    await newExp.save();
    res.status(201).json({ message: "Submitted for review" });
  } catch (err) {
    console.error("Submission error:", err);
    res.status(500).json({ error: "Server error during submission" });
  }
};

/* ────────────────────────── UP‑VOTE ──────────────────────────── */
const upvoteExperience = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.uid;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const exp = await Experience.findById(id);
    if (!exp) return res.status(404).json({ error: "Experience not found" });

    exp.upvotedBy = exp.upvotedBy || [];
    exp.upvotes = exp.upvotes || 0;

    const already = exp.upvotedBy.includes(userId);
    if (already) {
      exp.upvotedBy = exp.upvotedBy.filter((uid) => uid !== userId);
      exp.upvotes = Math.max(exp.upvotes - 1, 0);
    } else {
      exp.upvotedBy.push(userId);
      exp.upvotes += 1;
    }
    await exp.save();
    res.json({ upvotes: exp.upvotes, upvoted: !already });
  } catch (err) {
    console.error("Up‑vote error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ──────────────────────── PAGINATED LIST ─────────────────────── */
const getAllApproved = async (req, res) => {
  try {
    const { company, role, difficulty, sort = "latest", page = 1, limit = 12 } =
      req.query;

    const filter = { approved: true };
    if (company) filter.company = { $regex: `^${company}$`, $options: "i" };
    if (role) filter.roleApplied = { $regex: role, $options: "i" };
    if (difficulty) filter.difficulty = { $regex: difficulty, $options: "i" };

    const sortMap = { latest: { createdAt: -1 }, upvotes: { upvotes: -1 } };
    const safeLimit = Math.min(Number(limit) || 12, 50);
    const skip = (Math.max(Number(page), 1) - 1) * safeLimit;

    const [data, totalDocs] = await Promise.all([
      Experience.find(filter)
        .sort(sortMap[sort] || sortMap.latest)
        .skip(skip)
        .limit(safeLimit),
      Experience.countDocuments(filter),
    ]);

    res.json({
      data,
      page: Number(page),
      limit: safeLimit,
      totalPages: Math.ceil(totalDocs / safeLimit),
      totalDocs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ───────────────────── APPROVE / REJECT ─────────────────────── */
const approveExperience = async (req, res) => {
  try {
    const { id, action } = req.params;
    if (action === "approve") {
      await Experience.findByIdAndUpdate(id, { approved: true });
      return res.json({ message: "Experience approved" });
    } else if (action === "reject") {
      await Experience.findByIdAndDelete(id);
      return res.json({ message: "Experience rejected & deleted" });
    }
    return res.status(400).json({ error: "Invalid action." });
  } catch (err) {
    console.error("Admin action failed:", err);
    res.status(500).json({ error: "Server error during approval/rejection" });
  }
};

module.exports = {
  getExperience,
  getAll,
  getAllApproved,
  submitExperience,
  approveExperience,
  upvoteExperience,
};
