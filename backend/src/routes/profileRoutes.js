const router = require('express').Router();
const profileController = require('../controllers/profileController');
const authorize = require('../middleware/authorize');

router.get('/', authorize, profileController.getProfile);
router.put('/', authorize, profileController.updateProfile);
router.post('/save-step', authorize, profileController.saveStep);

module.exports = router;
