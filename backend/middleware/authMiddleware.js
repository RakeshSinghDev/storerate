const { verifyToken } = require('../utils/jwt');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing',
      });
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token payload',
      });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired',
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token signature',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

module.exports = {
  authenticate,
};
