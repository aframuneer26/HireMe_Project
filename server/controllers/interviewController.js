const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Start Interview (get questions)
exports.startInterview = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required to start interview" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate 5 interview questions for the role of ${role}.`;

    const result = await model.generateContent(prompt);
    const questions = result.response.text();

    res.json({
      message: "Interview questions generated successfully",
      questions,
    });
  } catch (error) {
    console.error("❌ Error generating interview questions:", error.message);
    res.status(500).json({ message: "Error starting interview" });
  }
};

// Evaluate Answer
exports.evaluateAnswer = async (req, res) => {
  try {
    const { question, answer, role } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: "Question and answer are required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
    Evaluate this answer for an interview:
    Role: ${role || "General"}
    Question: ${question}
    Candidate Answer: ${answer}
    
    Give feedback in 2-3 short bullet points (clear and concise).
    `;

    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    res.json({
      message: "Answer evaluated successfully",
      feedback,
    });
  } catch (error) {
    console.error("❌ Error evaluating answer:", error.message);
    res.status(500).json({ message: "Error evaluating answer" });
  }
};
