const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/run', authMiddleware, codeController.executeCode);

module.exports = router;
