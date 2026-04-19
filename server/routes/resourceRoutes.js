const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/fetch', authMiddleware, resourceController.getSkillResources);

module.exports = router;
