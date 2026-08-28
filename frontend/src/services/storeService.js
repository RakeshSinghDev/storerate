import { api } from './api';

export const storeService = {
  getStores: async ({ name = '', address = '', sortBy = 'created_at', order = 'desc', page = 1, limit = 20 } = {}) => {
    const queryParams = new URLSearchParams();
    if (name) queryParams.append('name', name);
    if (address) queryParams.append('address', address);
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (order) queryParams.append('order', order);
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);

    const queryString = queryParams.toString();
    const endpoint = `/stores${queryString ? `?${queryString}` : ''}`;
    return await api.get(endpoint);
  },

  getStoreById: async (id) => {
    return await api.get(`/stores/${id}`);
  },

  getMyRating: async (storeId) => {
    return await api.get(`/stores/${storeId}/ratings/me`);
  },

  getStoreRatingSummary: async (storeId) => {
    return await api.get(`/stores/${storeId}/ratings`);
  },

  createRating: async (storeId, rating) => {
    return await api.post(`/stores/${storeId}/ratings`, { rating });
  },

  updateRating: async (storeId, rating) => {
    return await api.put(`/stores/${storeId}/ratings`, { rating });
  },
};
