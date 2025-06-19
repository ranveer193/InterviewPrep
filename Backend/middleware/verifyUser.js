const admin = require("../firebase-admin");

const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    req.user = null; 
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
  } catch (err) {
    console.error("User token verification failed:", err);
    req.user = null; 
  }

  next();
};

module.exports = verifyUser;
