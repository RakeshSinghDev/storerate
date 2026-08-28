const ratingModel = require('../models/ratingModel');
const storeModel = require('../models/storeModel');

const ratingController = {
  createRating: async (req, res, next) => {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      if (isNaN(storeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store ID',
        });
      }

      const userId = req.user.userId;
      const { rating } = req.body;

      const store = await storeModel.findStoreById(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found',
        });
      }

      const existing = await ratingModel.findByUserAndStore(userId, storeId);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'You have already submitted a rating for this store.',
        });
      }

      const newRating = await ratingModel.createRating({
        userId,
        storeId,
        rating: Number(rating),
      });

      res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: newRating,
      });
    } catch (err) {
      next(err);
    }
  },

  updateRating: async (req, res, next) => {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      if (isNaN(storeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store ID',
        });
      }

      const userId = req.user.userId;
      const { rating } = req.body;

      const updated = await ratingModel.updateRating({
        userId,
        storeId,
        rating: Number(rating),
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'You have not rated this store yet.',
        });
      }

      res.json({
        success: true,
        message: 'Rating updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  getMyRating: async (req, res, next) => {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      if (isNaN(storeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store ID',
        });
      }

      const userId = req.user.userId;
      const rating = await ratingModel.findByUserAndStore(userId, storeId);

      res.json({
        success: true,
        data: {
          storeId,
          rating: rating ? Number(rating.rating) : null,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getStoreRatingSummary: async (req, res, next) => {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      if (isNaN(storeId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store ID',
        });
      }

      const store = await storeModel.findStoreById(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found',
        });
      }

      const summary = await ratingModel.getStoreRatingSummary(storeId);

      res.json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ratingController;
