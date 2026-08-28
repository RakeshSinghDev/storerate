const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All store owner routes require authentication and STORE_OWNER role authorization
router.use(authenticate, requireRole('STORE_OWNER'));

router.get('/dashboard', ownerController.getDashboard);
router.get('/store', ownerController.getOwnerStore);
router.get('/ratings', ownerController.getOwnerRatings);

module.exports = router;
