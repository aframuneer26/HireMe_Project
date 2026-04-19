const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getSkillResources = async (req, res) => {
  try {
    const { skills } = req.body; // Array of skills

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: "Please provide a list of skills." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      You are an expert technical educator and career librarian.
      Provide a highly curated list of learning resources for the following technical skills:
      ${skills.join(', ')}

      FOR EACH SKILL, PROVIDE:
      1. Documentation (Official site)
      2. Best Free Course (YouTube or similar)
      3. Best Paid/Certification Course (Udemy/Coursera/etc)
      4. A "Must-Read" article or book.

      FORMAT YOUR RESPONSE AS A CLEAN MARKDOWN LIST.
      For each skill, use a header.
      Under each skill, provide bullet points with [Title](URL).
      NO INTRO OR OUTRO.
      NO EMOJIS.
      BLACK AND WHITE THEME COMPATIBLE (Clean structure).
    `;

    const result = await model.generateContent(prompt);
    const resources = result.response.text();

    res.json({ resources });
  } catch (error) {
    console.error("Resource fetch error:", error);
    res.status(500).json({ message: "Failed to fetch resources." });
  }
};
