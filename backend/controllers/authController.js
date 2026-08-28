const userModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

const authController = {
  register: async (req, res, next) => {
    try {
      const { name, email, address, password } = req.body;

      const existingUser = await userModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email address already exists.',
        });
      }

      const passwordHash = await hashPassword(password);
      const user = await userModel.createUser({
        name,
        email,
        password_hash: passwordHash,
        address,
        role: 'NORMAL_USER', // Always hardcoded to NORMAL_USER for public registration
      });

      const token = generateToken({ userId: user.id, role: user.role });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: {
            id: Number(user.id),
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await userModel.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const isMatch = await comparePassword(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const token = generateToken({ userId: user.id, role: user.role });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: Number(user.id),
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getCurrentUser: async (req, res, next) => {
    try {
      const user = await userModel.findUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found',
        });
      }

      res.json({
        success: true,
        data: {
          id: Number(user.id),
          name: user.name,
          email: user.email,
          address: user.address,
          role: user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  updatePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await userModel.findUserByEmail((await userModel.findUserById(req.user.userId)).email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found',
        });
      }

      const isMatch = await comparePassword(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.',
        });
      }

      const newPasswordHash = await hashPassword(newPassword);
      await userModel.updatePassword(req.user.userId, newPasswordHash);

      res.json({
        success: true,
        message: 'Password updated successfully.',
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
