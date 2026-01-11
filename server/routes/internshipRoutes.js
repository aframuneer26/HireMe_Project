const express = require('express');
const { recommendInternships } = require('../controllers/internshipController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route
router.post('/recommend', authMiddleware, recommendInternships);

module.exports = router;
