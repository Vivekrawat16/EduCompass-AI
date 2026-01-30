const router = require('express').Router();
const applicationController = require('../controllers/applicationController');
const authorize = require('../middleware/authorize');

router.use(authorize);

router.get('/', applicationController.getApplications);
router.put('/:id', applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;
