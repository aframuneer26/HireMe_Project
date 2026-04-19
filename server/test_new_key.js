require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key);
    // Trying gemini-2.0-flash which is on the list
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    console.log("Testing gemini-2.0-flash...");
    const result = await model.generateContent("Hello");
    console.log("✅ SUCCESS:", result.response.text());
  } catch (error) {
    console.error("❌ FAILURE:", error.message);
    if (error.response) {
       console.error("Error Response:", JSON.stringify(error.response, null, 2));
    }
  }
}

testGemini();
