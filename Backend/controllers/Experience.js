const Experience = require('../models/Experience');

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
    const { company, role, difficulty, sort } = req.query;
    const filter = { approved: true };

    if (company) {
      filter.company = { $regex: new RegExp(`^${company}$`, "i") }; // exact match, case-insensitive
    }

    if (role) {
      filter.role = { $regex: role, $options: "i" }; // partial match, case-insensitive
    }

    if (difficulty) {
      filter.difficulty = { $regex: difficulty, $options: "i" }; // partial match, case-insensitive
    }

    const sortOptions = {
      latest: { createdAt: -1 },
      upvotes: { upvotes: -1 },
    };

    const data = await Experience.find(filter).sort(sortOptions[sort] || { createdAt: -1 });
    res.json(data);
  } catch (err) {
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

module.exports = {getExperience,getAll, getAllApproved, submitExperience, approveExperience,upvoteExperience };
