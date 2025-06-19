// middleware/verifyUser.js
const admin = require("../firebase-admin");

const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("User token verification failed:", err);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyUser;
