const mongoose = require("mongoose");

const InterviewGoalSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, 
    company: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    targetDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewGoal", InterviewGoalSchema);