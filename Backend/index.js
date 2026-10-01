const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ------------------ ensure tempUploads folder exists ------------------ */
const tempUploadDir = path.join(__dirname, "tempUploads");
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir);
  console.log("📂 Created tempUploads directory:", tempUploadDir);
}

// 🛡️ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded files if needed
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔗 Route imports
const interviewRoutes = require("./routes/interview");
const oaRoutes = require("./routes/oa");
const mockInterviewRoutes = require("./routes/mockInterview"); // 🆕 added
const analyzeRoute = require("./routes/analyzeResumePdf");
const interviewGoalRoutes = require("./routes/interviewGoalRoutes"); // 🆕 added
const aiRoutes = require("./routes/aiRoutes"); // 🆕 added

// 🧩 Route usage
app.use("/interview", interviewRoutes);
app.use("/oa", oaRoutes);
app.use("/mockInterview", mockInterviewRoutes); // 🆕 added
app.use("/ai", aiRoutes); // 🆕 added
app.use(analyzeRoute);
app.use("/interview-goal", interviewGoalRoutes); // 🆕 added

// 🧪 Test Route
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// 🔌 DB & Server Init
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
