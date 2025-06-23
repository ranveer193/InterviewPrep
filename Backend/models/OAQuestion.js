const mongoose = require("mongoose");

const oaQuestionSchema = new mongoose.Schema(
  {
    company:  { type: String, required: true },
    year:     { type: Number, required: true },
    role:     {
      type: String,
      enum: ["Internship", "Placement"],
      required: true,
    },
    question: { type: String, required: true },
    explanation: {
      type: String,
      required: false,
      default: "", 
    },
    approved: {
      type: Boolean,
      default: false,
    },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OAQuestion", oaQuestionSchema);