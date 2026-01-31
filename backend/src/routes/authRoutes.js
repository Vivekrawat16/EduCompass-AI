const router = require('express').Router();
const authController = require('../controllers/authController');
const authorize = require('../middleware/authorize');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authorize, authController.getMe);

module.exports = router;
