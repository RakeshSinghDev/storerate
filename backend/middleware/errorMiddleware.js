const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.status || 500);
  let clientMessage = err.message || 'Internal Server Error';

  // Handle PostgreSQL specific errors
  if (err.code === '23505') {
    statusCode = 409; // Duplicate conflict
    if (err.constraint && err.constraint.includes('email')) {
      clientMessage = 'A user with this email address already exists.';
    } else {
      clientMessage = 'A record with this unique constraint already exists.';
    }
  } else if (err.code === '23514') {
    statusCode = 400;
    clientMessage = 'Input violates database constraint criteria.';
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
