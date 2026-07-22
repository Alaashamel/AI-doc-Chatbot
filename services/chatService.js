const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-flash-latest"   
});

module.exports = model;