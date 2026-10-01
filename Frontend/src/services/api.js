import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

// 📦 API base from .env
const API_BASE = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_BASE + "/",
});

// 🔐 Wait for Firebase auth state before adding token
let authInitialized = false;
const authReady = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, () => {
    authInitialized = true;
    resolve();
    unsubscribe(); // only once
  });
});

api.interceptors.request.use(async (config) => {
  if (!authInitialized) await authReady;

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

// ⚡ Session storage cache helper for GET requests
const CACHE_PREFIX = "ip_cache_";

export async function cachedGet(url, options = {}, ttlMs = 5 * 60 * 1000) {
  const cacheKey = CACHE_PREFIX + url;

  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < ttlMs) {
          console.log(`[Cache] ⚡ Hit for ${url}`);
          return { data, fromCache: true };
        }
      }
    } catch (e) {
      /* ignore storage parse errors */
    }
  }

  const res = await api.get(url, options);

  if (typeof window !== "undefined" && window.sessionStorage && res.status === 200) {
    try {
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({ data: res.data, timestamp: Date.now() })
      );
    } catch (e) {
      /* ignore storage quota errors */
    }
  }

  return res;
}

export function invalidateCache(urlPattern = "") {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  const keys = Object.keys(sessionStorage);
  keys.forEach((key) => {
    if (key.startsWith(CACHE_PREFIX) && (!urlPattern || key.includes(urlPattern))) {
      sessionStorage.removeItem(key);
    }
  });
}

export default api;
