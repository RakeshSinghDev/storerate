const userModel = require('../models/userModel');
const { hashPassword } = require('../utils/password');

const userController = {
  getAllUsers: async (req, res, next) => {
    try {
      const { name, email, address, role, sortBy, sortOrder } = req.query;
      const users = await userModel.findAll({ name, email, address, role, sortBy, sortOrder });
      res.json({
        success: true,
        count: users.length,
        users,
      });
    } catch (err) {
      next(err);
    }
  },

  getUserById: async (req, res, next) => {
    try {
      const user = await userModel.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      res.json({
        success: true,
        user,
      });
    } catch (err) {
      next(err);
    }
  },

  createUser: async (req, res, next) => {
    try {
      const { name, email, password, address, role } = req.body;

      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email address already exists.',
        });
      }

      const passwordHash = await hashPassword(password);
      const newUser = await userModel.create({
        name,
        email,
        password_hash: passwordHash,
        address,
        role,
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: newUser,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = userController;
