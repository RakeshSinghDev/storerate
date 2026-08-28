const validateAdminCreateUser = (req, res, next) => {
  const { name, email, password, address, role } = req.body || {};

  const allowedRoles = ['NORMAL_USER', 'SYSTEM_ADMINISTRATOR', 'STORE_OWNER'];
  if (!role || !allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role must be one of: NORMAL_USER, SYSTEM_ADMINISTRATOR, STORE_OWNER',
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

const validateAdminCreateStore = (req, res, next) => {
  const { name, email, address, ownerId, owner_id } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Store name is required',
    });
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 60) {
    return res.status(400).json({
      success: false,
      message: 'Store name must be between 2 and 60 characters',
    });
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Store email is required',
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
      message: 'Store address is required',
    });
  }

  const trimmedAddress = address.trim();
  if (trimmedAddress.length > 400) {
    return res.status(400).json({
      success: false,
      message: 'Store address cannot exceed 400 characters',
    });
  }

  const targetOwnerId = ownerId !== undefined ? ownerId : owner_id;
  if (targetOwnerId !== undefined && targetOwnerId !== null && targetOwnerId !== '') {
    const parsedId = Number(targetOwnerId);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID must be a positive integer',
      });
    }
  }

  next();
};

module.exports = {
  validateAdminCreateUser,
  validateAdminCreateStore,
};
