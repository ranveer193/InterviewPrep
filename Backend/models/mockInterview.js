const mongoose = require("mongoose");

const mockInterviewSchema = new mongoose.Schema(
  {
    /* Who is taking the mock interview */
    userId: { type: String, required: true }, // Firebase UID or “anonymous”

    /* OA questions served to the candidate */
    questions: [
      {
        text: String,
        category: String,

        transcription: { type: String, default: "" },
        summary:       { type: String, default: "" },
        rating:        { type: Number, default: null },

        /* Per-question analysis objects */
        analysis: {
          speech:     { type: mongoose.Schema.Types.Mixed, default: {} }, // pauses, WPM…
          video:      { type: mongoose.Schema.Types.Mixed, default: {} }, // eye contact…
          voiceCoach: { type: mongoose.Schema.Types.Mixed, default: {} }, // NEW – delivery
        },
      },
    ],

    /* (Unused now) */
    videoUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MockInterview", mockInterviewSchema);
