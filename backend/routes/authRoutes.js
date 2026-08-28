const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  validateRegistrationInput,
  validateLoginInput,
  validatePasswordUpdateInput,
} = require('../validators/authValidator');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', validateRegistrationInput, authController.register);
router.post('/login', validateLoginInput, authController.login);
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/password', authenticate, validatePasswordUpdateInput, authController.updatePassword);

module.exports = router;
