const router = require('express').Router();
const userController = require('../controllers/userController');
const authorize = require('../middleware/authorize');

router.get('/status', authorize, userController.getUserStatus);

module.exports = router;
