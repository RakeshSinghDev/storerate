import request from './api';

export const ratingService = {
  submitOrUpdateRating: (storeId, rating) =>
    request(`/stores/${storeId}/ratings`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    }),
  getStoreRatings: (storeId) => request(`/stores/${storeId}/ratings`, { method: 'GET' }),
};
