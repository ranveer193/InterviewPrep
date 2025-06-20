const mongoose = require("mongoose");
const dotenv = require("dotenv");
const OAQuestion = require("../models/OAQuestion.js");

dotenv.config(); // Load MONGO_URI from .env

const MONGO_URI = process.env.MONGO_URI

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const sample =
    []

    const created = await OAQuestion.create(sample);
    console.log("📌 Sample OA Question added:\n", created);

    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  } catch (err) {
    console.error("❌ Error seeding OA Question:", err);
    process.exit(1);
  }
};

run();
