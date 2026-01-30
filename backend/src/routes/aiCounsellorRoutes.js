const express = require('express');
const router = express.Router();
const aiCounsellorController = require('../controllers/aiCounsellorController');
const authorize = require('../middleware/authorize'); // Correct Default Import

// POST /api/ai/counsellor/chat
router.post('/chat', authorize, aiCounsellorController.chat);

module.exports = router;
