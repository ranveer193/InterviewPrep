const Experience = require('../models/Experience');

const getAll = async (req, res) => {
  const data = await Experience.find({});
  res.json(data);
};

const getAllApproved = async (req, res) => {
  try {
    const { company, role } = req.query;
    const filter = { approved: true };

    if (company) {
      filter.company = { $regex: new RegExp(`^${company}$`, "i") };
    }

    if (role) {
      filter.role = { $regex: role, $options: "i" }; 
    }

    const data = await Experience.find(filter).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


const submitExperience = async (req, res) => {
  const exp = new Experience(req.body);
  await exp.save();
  res.status(201).json({ message: "Submitted for review" });
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

module.exports = {getAll, getAllApproved, submitExperience, approveExperience };
