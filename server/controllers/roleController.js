const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.suggestRoles = async (req, res) => {
  try {
    let { interests, qualifications } = req.body;

    if (!interests || !qualifications) {
      return res.status(400).json({ message: "Interests and qualifications are required" });
    }

    interests = interests.trim();
    qualifications = qualifications.trim();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Based on the following information:
- Interests: ${interests}
- Qualifications: ${qualifications}

Provide:
1. 3-5 suitable career roles.
2. Top 5 technical skills needed for each role.
3. Mention any missing skills the candidate should learn.

Format:
Role: ...
Required Skills: ...
Missing Skills: ...
Keep it short and concise.
    `;

    let roles = "Could not generate roles. Try again.";
    try {
      const result = await model.generateContent(prompt);
      roles = result.response.text() || roles;
    } catch (aiErr) {
      console.error("❌ Gemini API error in role generation:", aiErr.message);
    }

    res.json({
      message: "Roles and skill analysis generated successfully",
      roles,
    });
  } catch (error) {
    console.error("❌ Error generating roles:", error.message);
    res.status(500).json({ message: "Error generating role suggestions" });
  }
};
