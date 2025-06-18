const admin = require("firebase-admin");
require("dotenv").config();

const base64 = process.env.FIREBASE_ADMIN_CREDENTIALS_BASE64;

if (!base64) {
  throw new Error("FIREBASE_ADMIN_CREDENTIALS_BASE64 not set in .env");
}

const decoded = Buffer.from(base64, "base64").toString("utf-8");
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin; 
