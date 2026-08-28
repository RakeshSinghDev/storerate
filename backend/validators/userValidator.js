const { body, validationResult } = require('express-validator');

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

const createUserValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters long'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ max: 400 }).withMessage('Address cannot exceed 400 characters'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 16 }).withMessage('Password must be between 8 and 16 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/).withMessage('Password must contain at least one special character'),
  body('role')
    .trim()
    .notEmpty().withMessage('Role is required')
    .isIn(['SYSTEM_ADMINISTRATOR', 'NORMAL_USER', 'STORE_OWNER']).withMessage('Role must be SYSTEM_ADMINISTRATOR, NORMAL_USER, or STORE_OWNER'),
  validateResult,
];

module.exports = {
  createUserValidator,
};
