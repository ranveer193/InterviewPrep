const axios = require("axios");
dotenv = require("dotenv");
dotenv.config();

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  "HTTP-Referer": "https://yourdomain.com", 
  "X-Title": "InterviewPrepAI"
};

const askLLM = async function(prompt, model = "mistralai/mixtral-8x7b-instruct") {
  try {
    const res = await axios.post(
      ENDPOINT,
      {
        model,
        messages: [{ role: "user", content: prompt }],
      },
      { headers: HEADERS, timeout: 30000 }
    );
    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenRouter error →", err.response?.data || err.message);
    return null; // always fail gracefully
  }
}

module.exports = { askLLM };
