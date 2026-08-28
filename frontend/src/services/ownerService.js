import { api } from './api';

export const ownerService = {
  getOwnerDashboard: async ({ page = 1, limit = 20 } = {}) => {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);

    const queryString = queryParams.toString();
    const endpoint = `/owner/dashboard${queryString ? `?${queryString}` : ''}`;
    return await api.get(endpoint);
  },
};
