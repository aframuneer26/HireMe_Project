const express = require('express');
const { startInterview, evaluateAnswer } = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Generate interview questions
router.post('/start', authMiddleware, startInterview);

// Evaluate user's answer
router.post('/evaluate', authMiddleware, evaluateAnswer);

module.exports = router;
