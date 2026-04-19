const express = require('express');
const router = express.Router();
const mcqController = require('../controllers/mcqController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/next', authMiddleware, mcqController.getNextQuestion);
router.post('/review', authMiddleware, mcqController.getFinalReview);

module.exports = router;
