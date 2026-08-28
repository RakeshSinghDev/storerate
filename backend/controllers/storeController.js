const storeModel = require('../models/storeModel');

const storeController = {
  getStores: async (req, res, next) => {
    try {
      const { name, address, sortBy, order } = req.query;
      const userId = req.user.userId;

      let page = parseInt(req.query.page, 10) || 1;
      let limit = parseInt(req.query.limit, 10) || 20;
      if (page < 1) page = 1;
      if (limit < 1) limit = 20;
      if (limit > 100) limit = 100;
      const offset = (page - 1) * limit;

      const stores = await storeModel.findStoresForUser({
        userId,
        name,
        address,
        sortBy,
        order,
        limit,
        offset,
      });

      const total = await storeModel.countStoresForUser({ name, address });
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

  getStoreById: async (req, res, next) => {
    try {
      const storeId = parseInt(req.params.id, 10);
      if (isNaN(storeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store ID',
        });
      }

      const userId = req.user.userId;
      const store = await storeModel.findStoreByIdForUser(storeId, userId);

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found',
        });
      }

      res.json({
        success: true,
        data: store,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = storeController;
