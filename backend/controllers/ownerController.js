const storeModel = require('../models/storeModel');
const ratingModel = require('../models/ratingModel');

const ownerController = {
  getDashboard: async (req, res, next) => {
    try {
      const userId = req.user.userId;

      let page = parseInt(req.query.page, 10) || 1;
      let limit = parseInt(req.query.limit, 10) || 20;
      if (page < 1) page = 1;
      if (limit < 1) limit = 20;
      if (limit > 100) limit = 100;
      const offset = (page - 1) * limit;

      const storeDetailed = await storeModel.findStoreByOwnerIdDetailed(userId);

      if (!storeDetailed) {
        return res.json({
          success: true,
          data: {
            store: null,
            averageRating: null,
            ratingCount: 0,
            ratings: [],
          },
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      const storeId = storeDetailed.store.id;
      const ratings = await ratingModel.findRatingsByStoreIdPaginated(storeId, limit, offset);
      const total = await ratingModel.countRatingsByStoreId(storeId);
      const totalPages = Math.ceil(total / limit) || 0;

      res.json({
        success: true,
        data: {
          store: storeDetailed.store,
          averageRating: storeDetailed.averageRating,
          ratingCount: storeDetailed.ratingCount,
          ratings,
        },
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

  getOwnerStore: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const storeDetailed = await storeModel.findStoreByOwnerIdDetailed(userId);

      res.json({
        success: true,
        data: storeDetailed || {
          store: null,
          averageRating: null,
          ratingCount: 0,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getOwnerRatings: async (req, res, next) => {
    try {
      const userId = req.user.userId;

      let page = parseInt(req.query.page, 10) || 1;
      let limit = parseInt(req.query.limit, 10) || 20;
      if (page < 1) page = 1;
      if (limit < 1) limit = 20;
      if (limit > 100) limit = 100;
      const offset = (page - 1) * limit;

      const storeDetailed = await storeModel.findStoreByOwnerIdDetailed(userId);

      if (!storeDetailed) {
        return res.json({
          success: true,
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      const storeId = storeDetailed.store.id;
      const ratings = await ratingModel.findRatingsByStoreIdPaginated(storeId, limit, offset);
      const total = await ratingModel.countRatingsByStoreId(storeId);
      const totalPages = Math.ceil(total / limit) || 0;

      res.json({
        success: true,
        data: ratings,
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

module.exports = ownerController;
