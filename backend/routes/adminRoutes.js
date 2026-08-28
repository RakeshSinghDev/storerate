const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { validateAdminCreateUser, validateAdminCreateStore } = require('../validators/adminValidator');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Guard all admin routes with authentication and SYSTEM_ADMINISTRATOR authorization
router.use(authenticate, requireRole('SYSTEM_ADMINISTRATOR'));

router.get('/dashboard', adminController.getDashboardStats);

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', validateAdminCreateUser, adminController.createUser);

router.get('/stores', adminController.getStores);
router.post('/stores', validateAdminCreateStore, adminController.createStore);

module.exports = router;
