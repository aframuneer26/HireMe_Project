const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getNextQuestion = async (req, res) => {
  try {
    const { topic, currentLevel, history } = req.body; 
    // currentLevel: 'easy', 'medium', 'hard'
    // history: array of { question, options, userAnswer, correctAnswer, isCorrect }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      You are an expert technical interviewer creating an ADAPTIVE MCQ assessment.
      
      TOPIC: ${topic}
      CURRENT DIFFICULTY: ${currentLevel}
      HISTORY: ${JSON.stringify(history)}

      TASK:
      Generate one single MCQ question at the ${currentLevel} level.
      Do not repeat any questions from the history.
      
      RESPONSE FORMAT (STRICT JSON):
      {
        "question": "The question text",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "The exact correct option string",
        "explanation": "Short professional explanation",
        "difficulty": "${currentLevel}"
      }

      CRITICAL: Return ONLY the JSON object. No markdown, no prose.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const questionData = JSON.parse(text);

    res.json(questionData);
  } catch (error) {
    console.error("MCQ error:", error);
    res.status(500).json({ message: "Failed to generate question." });
  }
};

exports.getFinalReview = async (req, res) => {
    try {
      const { history, topic } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  
      const prompt = `
        The candidate has completed an adaptive MCQ test on ${topic}.
        Here is their full history: ${JSON.stringify(history)}
  
        Provide a professional performance review.
        FORMAT (MARKDOWN):
        # PERFORMANCE REPORT
        - **Overall Score**: [Percentage]%
        - **Difficulty Level Reached**: [Easy/Medium/Hard]
        - **Key Strengths**: [Bullets]
        - **Areas for Improvement**: [Bullets]
        
        No emojis. High-stakes B&W tone.
      `;
  
      const result = await model.generateContent(prompt);
      res.json({ review: result.response.text() });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate review." });
    }
};
