const router = require('express').Router();
const aiController = require('../controllers/aiController');
const authorize = require('../middleware/authorize');

// Helper wrapper to handle async errors in routes if not using a global handler (standard practice)
// all routes here protected by 'authorize'


router.post('/counsellor/chat', authorize, aiController.chat);
router.post('/counsellor/recommend', authorize, aiController.recommend);
router.post('/counsellor/actions', authorize, aiController.actions);

module.exports = router;
