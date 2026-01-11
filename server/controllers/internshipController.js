const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.recommendInternships = async (req, res) => {
  try {
    const { interests, goals } = req.body;

    if (!interests || !goals) {
      return res.status(400).json({ message: "Interests and goals are required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Based on the following details:
- Interests: ${interests}
- Career Goals: ${goals}

Suggest 5 internship roles or online learning programs (one line description each) that will help the user achieve their goals.
Return them as a simple bullet list.
    `;

    let internships = "Could not generate internships. Try again.";
    try {
      const result = await model.generateContent(prompt);
      internships = result.response.text() || internships;
    } catch (aiErr) {
      console.error("❌ Gemini API error in internship generation:", aiErr.message);
    }

    res.json({
      message: "Internship recommendations generated successfully",
      internships,
    });
  } catch (error) {
    console.error("❌ Server error generating internships:", error.message);
    res.status(500).json({ message: "Error generating internship recommendations" });
  }
};
