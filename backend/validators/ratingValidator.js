const validateRatingInput = (req, res, next) => {
  const { rating } = req.body || {};

  if (rating === undefined || rating === null) {
    return res.status(400).json({
      success: false,
      message: 'Rating is required',
    });
  }

  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be an integer between 1 and 5.',
    });
  }

  next();
};

module.exports = {
  validateRatingInput,
};
