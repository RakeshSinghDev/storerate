const validateRegistrationInput = (req, res, next) => {
  const { name, email, address, password, role } = req.body || {};

  // Privilege Escalation Security Check: Reject if role is supplied
  if (role !== undefined && role !== null) {
    return res.status(400).json({
      success: false,
      message: 'Role selection is not permitted during registration',
    });
  }

  if (!name || typeof name !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Name is required and must be a string',
    });
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 20 || trimmedName.length > 60) {
    return res.status(400).json({
      success: false,
      message: 'Name must be between 20 and 60 characters long',
    });
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Must be a valid email address format',
    });
  }

  if (!address || typeof address !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Address is required and must be a string',
    });
  }

  const trimmedAddress = address.trim();
  if (trimmedAddress.length > 400) {
    return res.status(400).json({
      success: false,
      message: 'Address cannot exceed 400 characters',
    });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Password is required',
    });
  }

  if (password.length < 8 || password.length > 16) {
    return res.status(400).json({
      success: false,
      message: 'Password must be between 8 and 16 characters long',
    });
  }

  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least one uppercase letter',
    });
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least one special character',
    });
  }

  next();
};

const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Must be a valid email address format',
    });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Password is required',
    });
  }

  next();
};

const validatePasswordUpdateInput = (req, res, next) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || typeof currentPassword !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Current password is required',
    });
  }

  if (!newPassword || typeof newPassword !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'New password is required',
    });
  }

  if (newPassword.length < 8 || newPassword.length > 16) {
    return res.status(400).json({
      success: false,
      message: 'Password must be between 8 and 16 characters long',
    });
  }

  if (!/[A-Z]/.test(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least one uppercase letter',
    });
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least one special character',
    });
  }

  next();
};

module.exports = {
  validateRegistrationInput,
  validateLoginInput,
  validatePasswordUpdateInput,
};
