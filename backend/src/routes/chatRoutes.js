const router = require('express').Router();
const chatController = require('../controllers/chatController');
const authorize = require('../middleware/authorize');

router.post('/', authorize, chatController.chat);

module.exports = router;
