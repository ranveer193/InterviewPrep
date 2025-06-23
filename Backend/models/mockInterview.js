const mongoose = require("mongoose");

const mockInterviewSchema = new mongoose.Schema(
  {
    /* Who is taking the mock interview */
    userId: {
      type: String, // Firebase UID or "anonymous"
      required: true,
    },

    /* OA questions served to the candidate */
    questions: [
      {
        text: String,
        category: String,

        // NEW fields per question
        transcription: { type: String, default: "" },
        summary: { type: String, default: "" },
        rating: { type: Number, default: null },
        analysis: {
          speech: { type: mongoose.Schema.Types.Mixed, default: {} }, // pauses, speed, etc.
          video: { type: mongoose.Schema.Types.Mixed, default: {} },  // eye contact, nods (optional)
        },
      },
    ],

    /* Optional video storage — now unused */
    videoUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MockInterview", mockInterviewSchema);
