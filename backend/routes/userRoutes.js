const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { createUserValidator } = require('../validators/userValidator');
const { updatePasswordValidator } = require('../validators/authValidator');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// User password update
router.put('/:id/password', authenticate, updatePasswordValidator, authController.updatePassword);

// Admin-only user management routes
router.get('/', authenticate, requireRole('SYSTEM_ADMINISTRATOR'), userController.getAllUsers);
router.get('/:id', authenticate, requireRole('SYSTEM_ADMINISTRATOR'), userController.getUserById);
router.post('/', authenticate, requireRole('SYSTEM_ADMINISTRATOR'), createUserValidator, userController.createUser);

module.exports = router;
