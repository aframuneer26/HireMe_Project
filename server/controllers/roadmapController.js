const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateRoadmap = async (req, res) => {
  try {
    // Extract data from FormData (sent from frontend)
    const { interests, qualifications, goals } = req.body;
    const resumeFile = req.file; // multer adds this
    
    if (!interests || !qualifications || !goals) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Handle resume text (for now, just indicate if file was uploaded)
    const resumeText = resumeFile ? `Resume file uploaded: ${resumeFile.originalname}` : "No resume uploaded";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a career advisor. Based on:
- Interests: ${interests}
- Qualifications: ${qualifications}
- Career Goals: ${goals}
- Resume: ${resumeText}

Provide:
1. 3 key steps to achieve the goal (use bullet points).
2. Missing skills (if any) from resume (short list).
3. 2-3 suitable internship or online program suggestions.

Keep answers short, clear, and concise.
    `;

    let roadmap = "Could not generate roadmap. Try again.";
    try {
      const result = await model.generateContent(prompt);
      roadmap = result.response.text() || roadmap;
    } catch (aiErr) {
      console.error("❌ Gemini API error in roadmap generation:", aiErr.message);
    }

    res.json({ roadmap });
  } catch (error) {
    console.error("❌ Roadmap generation failed:", error.message);
    res.status(500).json({ message: "Error generating roadmap" });
  }
};
