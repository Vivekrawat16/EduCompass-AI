const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const authorize = require('../middleware/authorize');

// All Dashboard routes are protected (but don't require profile completion)
router.use(authorize);

router.get('/summary', dashboardController.getDashboardSummary);
router.get('/tasks', dashboardController.getTasks);
router.put('/tasks/:id', dashboardController.updateTask);

module.exports = router;
