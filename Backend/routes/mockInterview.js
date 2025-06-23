const express      = require("express");
const verifyToken  = require("../middleware/verifyToken");
const upload       = require("../middleware/multerConfig");

const {
  createMockInterview,
  transcribeVideo,
  analyzeTranscript,
  getInterviewResult,
  getInterviewStatus,
} = require("../controllers/mockInterview");

const MockInterview = require("../models/mockInterview");

const router = express.Router();

/* ---------- routes ---------- */
router.post("/create", verifyToken, createMockInterview);

router.get("/my", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const rows = await MockInterview.find({ userId })
      .select("company createdAt questions.summary questions.rating")
      .sort({ createdAt: -1 });

    res.json({ success: true, interviews: rows });
  } catch (err) {
    console.error("my-interviews route error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🏆 Leaderboard (top by average rating)
router.get("/leaderboard/top", async (req, res) => {
  try {
    const agg = await MockInterview.aggregate([
      { $unwind: "$questions" },
      { $match: { "questions.rating": { $ne: null } } },
      {
        $group: {
          _id: "$userId",
          avgRating: { $avg: "$questions.rating" },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1 } },
      { $limit: 10 },
    ]);
    res.json({ leaderboard: agg });
  } catch (err) {
    console.error("[GET /leaderboard]", err);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

router.get("/:id/status", verifyToken, getInterviewStatus);

router.post(
  "/:id/transcribe",
  verifyToken,
  upload.single("video"),
  transcribeVideo
);

router.post("/:id/analyze", verifyToken, analyzeTranscript);
router.get("/:id/result",  verifyToken, getInterviewResult);

// ✅ Get single interview summary
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const interview = await MockInterview.findById(req.params.id);
    if (!interview || interview.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });
    res.json({ interview });
  } catch (err) {
    console.error("[GET /:id]", err);
    res.status(500).json({ error: "Failed to fetch" });
  }
});

// ❌ Delete interview
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const interview = await MockInterview.findById(req.params.id);
    if (!interview || interview.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });
    await interview.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error("[DELETE /:id]", err);
    res.status(500).json({ error: "Failed to delete" });
  }
});

module.exports = router;
