require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("No GEMINI_API_KEY found in .env");
    
    console.log("Using Key prefix:", key.substring(0, 8));
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    const result = await model.generateContent("Hi, are you working?");
    console.log("✅ API SUCCESS:", result.response.text());
  } catch (error) {
    console.error("❌ API FAILURE:", error.message);
  }
}

testGemini();
