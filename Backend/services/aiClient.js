const axios = require("axios");
require("dotenv").config();

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const BASE_HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  "HTTP-Referer": "https://yourdomain.com",
  "X-Title": "InterviewPrepAI",
};

async function chatCompletion(messages, model = "mistralai/mixtral-8x7b-instruct") {
  try {
    const res = await axios.post(
      ENDPOINT,
      { model, messages, stream: false },
      { headers: BASE_HEADERS, timeout: 30_000 }
    );
    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenRouter error →", err.response?.data || err.message);
    throw new Error("AI request failed");
  }
}

module.exports = { chatCompletion };
