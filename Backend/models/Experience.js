const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    duration: { type: String, trim: true },  
    mode: { type: String, enum: ["Online", "Offline","Hybrid"], trim: true },
    codingProblems: { type: Number, min: 0 },
    description: { type: String, trim: true },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
 
    email: {
      type: String,
      required: function () {
      return !this.anonymous;
      },
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    experience: { type: String, enum: ["0–1 years", "1–2 years", "2+ years"] },
    role: { type: String, trim: true },
    linkedin: {
      type: String,
      trim: true,
      match: /^https?:\/\/(www\.)?linkedin\.com\/.*$/i,
    },

    company: { type: String, required: true, trim: true },
    roleApplied: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },

    content: { type: String, default: "", trim: true },
    summary:  { type: String, default: null }, 
    upvotes: { type: Number, default: 0, index: -1 },
    upvotedBy: [{ type: String }], 
    approved: { type: Boolean, default: false },

    mode: { type: String, enum: ["Online", "Offline","Hybrid"], trim: true },
    applicationMode: {
      type: String,
      enum: ["Referral", "On-Campus", "Off-Campus", "Other"],
      trim: true,
    },
    timeline: { type: String, trim: true },
    salary: { type: String, trim: true },

    rounds: { type: [roundSchema], default: [] },

    preparationTips: { type: [String], default: [] },
    generalAdvice: { type: [String], default: [] },

    anonymous: { type: Boolean, default: false },
    submittedBy: { type: String, default: null }

  },
  { timestamps: true }
);

experienceSchema.index({ company: "text", roleApplied: "text" });

module.exports = mongoose.model("Experience", experienceSchema);
