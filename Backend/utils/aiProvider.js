const axios = require("axios");
require("dotenv").config();

/* ───────── Provider Configuration ─────────
   Add new providers by appending to this array.
   They are tried in order; first success wins.
   ──────────────────────────────────────────── */
const PROVIDERS = [
  {
    name: "groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
    timeout: 15000,
    headers: {},
  },
  {
    name: "openrouter",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || "qwen/qwen3.8-27b:free",
    timeout: 30000,
    headers: {
      "HTTP-Referer": "https://interviewprep.app",
      "X-Title": "InterviewPrepAI",
    },
  },
];

/* ───────── Core request function ───────── */
async function callProvider(provider, messages) {
  const res = await axios.post(
    provider.endpoint,
    { model: provider.model, messages, stream: false },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
        ...provider.headers,
      },
      timeout: provider.timeout,
    }
  );
  return res.data.choices[0].message.content.trim();
}

/* ───────── Failover chain ───────── */
async function callWithFailover(messages) {
  const activeProviders = PROVIDERS.filter((p) => p.apiKey);

  if (activeProviders.length === 0) {
    throw new Error("No AI providers configured. Set GROQ_API_KEY or OPENROUTER_API_KEY.");
  }

  let lastError = null;

  for (const provider of activeProviders) {
    try {
      const start = Date.now();
      const result = await callProvider(provider, messages);
      const ms = Date.now() - start;
      console.log(`[AI] ✅ ${provider.name} responded in ${ms}ms`);
      return result;
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message || err.message;
      console.warn(`[AI] ⚠️ ${provider.name} failed (${status || "ERR"}): ${msg}`);
      lastError = err;
      // Continue to next provider
    }
  }

  throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
}

/* ───────── Public API ───────── */

/**
 * Simple prompt → text response.
 * Tries each provider in order until one succeeds.
 */
async function askLLM(prompt) {
  try {
    return await callWithFailover([{ role: "user", content: prompt }]);
  } catch (err) {
    console.error("[AI] askLLM failed:", err.message);
    return null;
  }
}

/**
 * System + user messages → text response.
 * Tries each provider in order until one succeeds.
 */
async function chatCompletion(messages) {
  return await callWithFailover(messages);
}

module.exports = { askLLM, chatCompletion };
