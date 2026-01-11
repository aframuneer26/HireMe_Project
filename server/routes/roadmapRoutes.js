const express = require('express');
const multer = require('multer');
const { generateRoadmap } = require('../controllers/roadmapController');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Roadmap generation with optional resume upload (NO AUTH for testing)
router.post('/generate', upload.single('resume'), generateRoadmap);

module.exports = router;
