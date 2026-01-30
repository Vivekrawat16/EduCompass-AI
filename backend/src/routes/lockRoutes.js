const router = require('express').Router();
const lockController = require('../controllers/lockController');
const authorize = require('../middleware/authorize');

router.post('/', authorize, lockController.lockUniversity);
router.get('/', authorize, lockController.getLockedUniversity);
router.get('/all', authorize, lockController.getAllLocked);
router.delete('/:university_id', authorize, lockController.unlockUniversity);

module.exports = router;
