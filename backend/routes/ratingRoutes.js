const express = require('express');
const router = express.Router({ mergeParams: true });
const ratingController = require('../controllers/ratingController');
const { validateRatingInput } = require('../validators/ratingValidator');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Route order: /me MUST be defined before generic routes
router.get('/me', authenticate, ratingController.getMyRating);
router.get('/', authenticate, ratingController.getStoreRatingSummary);

router.post('/', authenticate, requireRole('NORMAL_USER'), validateRatingInput, ratingController.createRating);
router.put('/', authenticate, requireRole('NORMAL_USER'), validateRatingInput, ratingController.updateRating);

module.exports = router;
