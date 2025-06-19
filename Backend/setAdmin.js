const admin = require("./firebase-admin");
require("dotenv").config();

const uid = "user_uid"; 

admin
  .auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`Custom claims set for user ${uid}`);
    process.exit();
  })
  .catch((err) => {
    console.error("Error setting custom claims:", err);
    process.exit(1);
  });
