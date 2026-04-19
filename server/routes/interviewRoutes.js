const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/start', authMiddleware, upload.single('resume'), interviewController.startInterview);
router.post('/answer', authMiddleware, interviewController.processAnswer);

module.exports = router;
