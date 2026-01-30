const router = require('express').Router();
const authController = require('../controllers/authController');
const passport = require('../../config/passport');
const authorize = require('../middleware/authorize');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authorize, authController.getMe);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    authController.googleCallback
);

module.exports = router;
