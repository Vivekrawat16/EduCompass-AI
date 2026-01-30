const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const authorize = require('../middleware/authorize');
const checkProfileComplete = require('../middleware/checkProfileComplete');

// All Dashboard routes are protected AND require profile completion
router.use(authorize);
router.use(checkProfileComplete);

router.get('/summary', dashboardController.getDashboardSummary);
router.get('/tasks', dashboardController.getTasks);
router.put('/tasks/:id', dashboardController.updateTask);

module.exports = router;
