const userModel = require('../models/userModel');
const storeModel = require('../models/storeModel');
const ratingModel = require('../models/ratingModel');
const { hashPassword } = require('../utils/password');

const adminController = {
  getDashboardStats: async (req, res, next) => {
    try {
      const totalUsers = await userModel.countAll();
      const totalStores = await storeModel.countAll();
      const totalRatings = await ratingModel.countAll();

      res.json({
        success: true,
        data: {
          totalUsers,
          totalStores,
          totalRatings,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  createUser: async (req, res, next) => {
    try {
      const { name, email, password, address, role } = req.body;

      const existingUser = await userModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email address already exists.',
        });
      }

      const passwordHash = await hashPassword(password);
      const newUser = await userModel.createUser({
        name,
        email,
        password_hash: passwordHash,
        address,
        role,
      });

      res.status(201).json({
        success: true,
        message: 'User account created successfully',
        data: {
          id: Number(newUser.id),
          name: newUser.name,
          email: newUser.email,
          address: newUser.address,
          role: newUser.role,
          created_at: newUser.created_at,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  createStore: async (req, res, next) => {
    try {
      const { name, email, address, ownerId, owner_id } = req.body;
      const targetOwnerId = ownerId !== undefined ? ownerId : owner_id;

      if (targetOwnerId) {
        const parsedOwnerId = Number(targetOwnerId);
        const ownerUser = await userModel.findUserById(parsedOwnerId);

        if (!ownerUser) {
          return res.status(400).json({
            success: false,
            message: 'Specified store owner user does not exist.',
          });
        }

        if (ownerUser.role !== 'STORE_OWNER') {
          return res.status(400).json({
            success: false,
            message: 'Selected user does not have the STORE_OWNER role.',
          });
        }
      }

      const newStore = await storeModel.createStore({
        name,
        email,
        address,
        ownerId: targetOwnerId ? Number(targetOwnerId) : null,
      });

      res.status(201).json({
        success: true,
        message: 'Store created successfully',
        data: newStore,
      });
    } catch (err) {
      next(err);
    }
  },

  getUsers: async (req, res, next) => {
    try {
      const { name, email, address, role, sortBy, order } = req.query;

      let page = parseInt(req.query.page, 10) || 1;
      let limit = parseInt(req.query.limit, 10) || 20;
      if (page < 1) page = 1;
      if (limit < 1) limit = 20;
      if (limit > 100) limit = 100;
      const offset = (page - 1) * limit;

      const users = await userModel.findUsers({
        name,
        email,
        address,
        role,
        sortBy,
        order,
        limit,
        offset,
      });

      const total = await userModel.countUsers({ name, email, address, role });
      const totalPages = Math.ceil(total / limit) || 1;

      res.json({
        success: true,
        data: users.map(u => ({
          id: Number(u.id),
          name: u.name,
          email: u.email,
          address: u.address,
          role: u.role,
          created_at: u.created_at,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getUserById: async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
      }

      const userDetailed = await userModel.findUserByIdDetailed(userId);
      if (!userDetailed) {
        return res.status(404).json({
          success: false,
          message: 'User account not found',
        });
      }

      res.json({
        success: true,
        data: userDetailed,
      });
    } catch (err) {
      next(err);
    }
  },

  getStores: async (req, res, next) => {
    try {
      const { name, email, address, sortBy, order } = req.query;

      let page = parseInt(req.query.page, 10) || 1;
      let limit = parseInt(req.query.limit, 10) || 20;
      if (page < 1) page = 1;
      if (limit < 1) limit = 20;
      if (limit > 100) limit = 100;
      const offset = (page - 1) * limit;

      const stores = await storeModel.findStores({
        name,
        email,
        address,
        sortBy,
        order,
        limit,
        offset,
      });

      const total = await storeModel.countStores({ name, email, address });
      const totalPages = Math.ceil(total / limit) || 1;

      res.json({
        success: true,
        data: stores,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = adminController;
