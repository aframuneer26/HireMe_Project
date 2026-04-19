const Interview = require('../models/Interview');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Constants ──────────────────────────────────────────────────────────────
const MAX_QUESTIONS = 5;

// ─── Start Interview ────────────────────────────────────────────────────────
exports.startInterview = async (req, res) => {
  try {
    const { topic, resumeText } = req.body;
    const userId = req.user.id;

    // 1. Create a new interview session
    const interview = new Interview({
      userId,
      topic: topic || 'General Technical Roles',
      resumeText: resumeText || '',
      history: []
    });

    // 2. Build First Question prompt
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `
      You are an expert technical recruiter or hiring manager.
      You are conducting a professional mock interview for a candidate.
      
      CONTEXT:
      Topic: ${topic || 'General'}
      Candidate Resume Info: ${resumeText || 'No resume provided'}

      INSTRUCTIONS:
      - Ask the VERY FIRST question of the interview.
      - Make it professional and relevant to the context.
      - Do NOT ask more than one question.
      - Avoid long introductions. Just say: "Hello, I am [Name]. Let's start the interview. [Question]"
      
      FORMAT:
      Plain text only. No emojis.
    `;

    const result = await model.generateContent(prompt);
    const firstQuestion = result.response.text().trim();

    // 3. Save first question to history
    interview.history.push({
      role: 'interviewer',
      content: firstQuestion
    });
    await interview.save();

    res.json({
      interviewId: interview._id,
      question: firstQuestion,
      isFinished: false
    });
  } catch (error) {
    console.error("Start Interview Error:", error);
    res.status(500).json({ message: "Failed to start interview." });
  }
};

// ─── Process Answer ─────────────────────────────────────────────────────────
exports.processAnswer = async (req, res) => {
  try {
    const { interviewId, answer } = req.body;
    const interview = await Interview.findById(interviewId);

    if (!interview || interview.status === 'completed') {
      return res.status(400).json({ message: "Invalid or completed interview session." });
    }

    // 1. Save candidate's answer
    interview.history.push({
      role: 'candidate',
      content: answer
    });

    const questionCount = interview.history.filter(h => h.role === 'interviewer').length;

    // 2. Call AI to evaluate answer and ask next question (or finish)
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const isLastQuestion = questionCount >= MAX_QUESTIONS;

    const chatHistory = interview.history.map(h => `${h.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${h.content}`).join('\n');

    const prompt = isLastQuestion 
      ? `
        The interview is now complete. 
        Evaluate the candidate's performance based on the full conversation history below:
        
        ${chatHistory}

        PROVIDE FEEDBACK IN THE FOLLOWING FORMAT:
        OVERALL_SCORE: [Number 1-100]
        SUMMARY: [A professional summary of strengths and weaknesses]
        AREAS_FOR_IMPROVEMENT: [Bullet points of things to work on]
      `
      : `
        You are conducting a mock interview. Here is the conversation so far:
        ${chatHistory}

        INSTRUCTIONS:
        1. Briefly acknowledge the candidate's last answer (1 sentence).
        2. Ask the NEXT logical interview question.
        3. Do NOT provide feedback yet.
        4. ONLY ask one question.

        FORMAT:
        Plain text only. No emojis.
      `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text().trim();

    if (isLastQuestion) {
      // Parse feedback and score (simplified)
      const scoreMatch = aiResponse.match(/OVERALL_SCORE:\s*(\d+)/);
      interview.overallScore = scoreMatch ? parseInt(scoreMatch[1]) : 70;
      interview.finalFeedback = aiResponse;
      interview.status = 'completed';
      await interview.save();

      return res.json({
        feedback: aiResponse,
        score: interview.overallScore,
        isFinished: true
      });
    } else {
      // Save next question to history
      interview.history.push({
        role: 'interviewer',
        content: aiResponse
      });
      await interview.save();

      return res.json({
        question: aiResponse,
        isFinished: false
      });
    }
  } catch (error) {
    console.error("Process Answer Error:", error);
    res.status(500).json({ message: "Failed to process answer." });
  }
};
