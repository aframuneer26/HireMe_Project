const express = require('express');
const { suggestRoles } = require('../controllers/roleController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route
router.post('/suggest', authMiddleware, suggestRoles);

module.exports = router;
