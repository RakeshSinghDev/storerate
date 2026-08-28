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

const storeValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Store name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Store name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Store email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('address')
    .trim()
    .notEmpty().withMessage('Store address is required')
    .isLength({ max: 400 }).withMessage('Store address cannot exceed 400 characters'),
  body('owner_id')
    .optional({ nullable: true })
    .isInt().withMessage('Owner ID must be a valid integer ID'),
  validateResult,
];

module.exports = {
  storeValidator,
};
