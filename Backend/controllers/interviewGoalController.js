const InterviewGoal = require("../models/InterviewGoal");

/**
 * GET /interview-goal
 * Fetch all goals for the logged-in user
 */
const getGoals = async (req, res) => {
  try {
    const userId = req.user.uid;
    const goals = await InterviewGoal.find({ userId }).sort({ targetDate: 1 });
    res.json(goals);
  } catch (err) {
    console.error("Fetch goals error", err);
    res.status(500).json({ message: "Server error" });
  }
};


const getGoal = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const goal = await InterviewGoal.find({ _id: id, userId });
    res.json(goal);
  } catch (err) {
    console.error("Fetch goal error", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /interview-goal
 * Create a new goal
 */
const createGoal = async (req, res) => {
  try {
    const { company, role, targetDate } = req.body;
    const userId = req.user.uid;

    if (!company || !targetDate) {
      return res.status(400).json({ message: "Company and targetDate required" });
    }

    const goal = await InterviewGoal.create({ userId, company, role, targetDate });
    res.status(201).json(goal);
  } catch (err) {
    console.error("Create goal error", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /interview-goal/:id
 * Update a specific goal
 */
const patchGoal = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const update = req.body;

    const goal = await InterviewGoal.findOneAndUpdate(
      { _id: id, userId },
      update,
      { new: true }
    );

    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json(goal);
  } catch (err) {
    console.error("Patch goal error", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /interview-goal/:id
 * Delete a goal by ID
 */
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const deleted = await InterviewGoal.findOneAndDelete({ _id: id, userId });

    if (!deleted) return res.status(404).json({ message: "Goal not found" });

    res.json({ message: "Interview goal deleted" });
  } catch (err) {
    console.error("Delete goal error", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getGoals,
  createGoal,
  patchGoal,
  deleteGoal,
  getGoal
};
