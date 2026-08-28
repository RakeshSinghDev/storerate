const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const ratingRoutes = require('./ratingRoutes');
const { authenticate } = require('../middleware/authMiddleware');

// Mount nested rating routes: /api/stores/:storeId/ratings
router.use('/:storeId/ratings', ratingRoutes);

// Store routes require authentication
router.get('/', authenticate, storeController.getStores);
router.get('/:id', authenticate, storeController.getStoreById);

module.exports = router;
