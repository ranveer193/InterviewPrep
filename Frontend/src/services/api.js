import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// 📦 API base from .env
const API_BASE = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_BASE + "/",
});

// 🔐 Wait for Firebase auth state before adding token
let authInitialized = false;
const authReady = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(getAuth(), () => {
    authInitialized = true;
    resolve();
    unsubscribe(); // only once
  });
});

api.interceptors.request.use(async (config) => {
  if (!authInitialized) await authReady;

  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      console.error("❌ Failed to get Firebase token:", err);
    }
  }

  return config;
});

export default api;
