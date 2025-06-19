const mongoose = require("mongoose");

const upvoteSchema = new mongoose.Schema(
  {
    expId: { type: mongoose.Schema.Types.ObjectId, ref: "Experience", index: true },
    userId: { type: String, index: true },        // Firebase UID
  },
  { timestamps: true }
);
upvoteSchema.index({ expId: 1, userId: 1 }, { unique: true });
module.exports = mongoose.model("ExperienceUpvote", upvoteSchema);