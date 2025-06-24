const express = require("express");
const { getGoals, createGoal, getGoal, patchGoal, deleteGoal } = require("../controllers/interviewGoalController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Fetch all goals for the logged-in user
router.get("/", verifyToken, getGoals);

// Fetch a specific goal by ID
router.get("/:id", verifyToken, getGoal);

// Create or update a goal
router.post("/", verifyToken, createGoal);

// Update a goal by ID
router.patch("/:id", verifyToken, patchGoal);

// Delete a goal by ID
router.delete("/:id", verifyToken, deleteGoal);

module.exports = router;