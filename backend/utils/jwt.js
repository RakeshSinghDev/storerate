const jwt = require('jsonwebtoken');

const getSecret = () => process.env.JWT_SECRET || 'super_secret_key_store_rating_2026';
const getExpiresIn = () => process.env.JWT_EXPIRES_IN || '1d';

const generateToken = (payload) => {
  return jwt.sign(payload, getSecret(), { expiresIn: getExpiresIn() });
};

const verifyToken = (token) => {
  return jwt.verify(token, getSecret());
};

module.exports = {
  generateToken,
  verifyToken,
};
