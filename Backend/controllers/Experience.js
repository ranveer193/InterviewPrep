const Experience = require('../models/Experience');
const Upvote = require("../models/ExperienceUpvote");

const toggleUpvote = async (req, res) => {
  const { id } = req.params;          // experience id
  const userId = req.user.uid;        // from verifyToken
  try {
    const existing = await Upvote.findOne({ expId: id, userId });

    if (existing) {
      await existing.deleteOne();
      await Experience.findByIdAndUpdate(id, { $inc: { upvotes: -1 } });
      return res.json({ upvoted: false });
    }

    await Upvote.create({ expId: id, userId });
    await Experience.findByIdAndUpdate(id, { $inc: { upvotes: 1 } });
    res.json({ upvoted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not toggle up‑vote" });
  }
};

const getAll = async (req, res) => {
  const data = await Experience.find({});
  res.json(data);
};

const getExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await Experience.findById(id);
    if (!experience) {
      return res.status(404).json({ error: "Experience not found" });
    }
    res.json(experience);
  } catch (err) {
    console.error("Error during experience retrieval:", err);
    res.status(500).json({ error: "Server error during experience retrieval" });
  }
};

const upvoteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await Experience.findById(id);

    if (!experience) {
      return res.status(404).json({ error: "Experience not found" });
    }

    experience.upvotes += 1;
    await experience.save();

    res.json({ message: "Upvoted successfully", upvotes: experience.upvotes });
  } catch (err) {
    console.error("Error during upvote:", err);
    res.status(500).json({ error: "Server error during upvote" });
  }
};

const getAllApproved = async (req, res) => {
  try {
    const { company, role, difficulty, sort = "latest", page = 1, limit = 12 } = req.query;

    const filter = { approved: true };
    if (company) filter.company = { $regex: `^${company}$`, $options: "i" };
    if (role)    filter.roleApplied = { $regex: role, $options: "i" };
    if (difficulty) filter.difficulty = { $regex: difficulty, $options: "i" };

    const sortMap = { latest: { createdAt: -1 }, upvotes: { upvotes: -1 } };

    const safeLimit = Math.min(Number(limit) || 12, 50);
    const skip = (Math.max(Number(page), 1) - 1) * safeLimit;

    const [data, totalDocs] = await Promise.all([
      Experience.find(filter).sort(sortMap[sort] || sortMap.latest).skip(skip).limit(safeLimit),
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

const submitExperience = async (req, res) => {
  try {
    const { anonymous, ...data } = req.body;

    // If anonymous, strip personally identifying fields
    if (anonymous) {
      data.name = "Anonymous";
      data.email = undefined;
      data.linkedin = undefined;
    }

    // Add user UID if authenticated and not anonymous
    if (!anonymous && req.user?.uid) {
      data.submittedBy = req.user.uid;
    }

    const newExp = new Experience({
      ...data,
      anonymous: !!anonymous,
    });

    await newExp.save();
    res.status(201).json({ message: "Submitted for review" });
  } catch (err) {
    console.error("Submission error:", err);
    res.status(500).json({ error: "Server error during submission" });
  }
};

const approveExperience = async (req, res) => {
  try {
    const { id,action } = req.params;

    if (action === "approve") {
      await Experience.findByIdAndUpdate(id, { approved: true });
      return res.json({ message: "Experience approved successfully." });
    } else if (action === "reject") {
      await Experience.findByIdAndDelete(id);
      return res.json({ message: "Experience rejected and deleted." });
    } else {
      return res.status(400).json({ error: "Invalid action." });
    }
  } catch (err) {
    console.error("Admin action failed:", err);
    res.status(500).json({ error: "Server error during approval/rejection." });
  }
};

module.exports = {toggleUpvote,getExperience,getAll, getAllApproved, submitExperience, approveExperience,upvoteExperience };
