const express = require('express');
const { generateRoadmap } = require('../controllers/roadmapController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/generate', authMiddleware, generateRoadmap);
module.exports = router;
