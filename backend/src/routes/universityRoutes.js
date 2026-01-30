const router = require('express').Router();
const universityController = require('../controllers/universityController');
const authorize = require('../middleware/authorize');

/**
 * University Routes
 * 
 * NOTE: External university APIs were removed due to network restrictions.
 * The /import endpoint is kept for informational purposes only (returns 501).
 * Universities are managed via PostgreSQL database only.
 */

// Discovery endpoints
router.get('/', authorize, universityController.getAllUniversities);
router.get('/recommendations', authorize, universityController.getRecommendations);
router.get('/shortlist', authorize, universityController.getShortlist);
router.post('/shortlist', authorize, universityController.shortlistUniversity);
router.delete('/shortlist/:id', authorize, universityController.removeFromShortlist);

// Import endpoint (informational only - external APIs disabled)
router.post('/import', authorize, universityController.importUniversities);

module.exports = router;
