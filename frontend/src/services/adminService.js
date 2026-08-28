import { api } from './api';

export const adminService = {
  getDashboard: async () => {
    return await api.get('/admin/dashboard');
  },

  getUsers: async ({ name = '', email = '', address = '', role = '', sortBy = 'created_at', order = 'desc', page = 1, limit = 20 } = {}) => {
    const queryParams = new URLSearchParams();
    if (name) queryParams.append('name', name);
    if (email) queryParams.append('email', email);
    if (address) queryParams.append('address', address);
    if (role) queryParams.append('role', role);
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (order) queryParams.append('order', order);
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);

    const queryString = queryParams.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;
    return await api.get(endpoint);
  },

  getUserById: async (id) => {
    return await api.get(`/admin/users/${id}`);
  },

  createUser: async ({ name, email, password, address, role }) => {
    return await api.post('/admin/users', { name, email, password, address, role });
  },

  getStores: async ({ name = '', email = '', address = '', sortBy = 'created_at', order = 'desc', page = 1, limit = 20 } = {}) => {
    const queryParams = new URLSearchParams();
    if (name) queryParams.append('name', name);
    if (email) queryParams.append('email', email);
    if (address) queryParams.append('address', address);
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (order) queryParams.append('order', order);
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);

    const queryString = queryParams.toString();
    const endpoint = `/admin/stores${queryString ? `?${queryString}` : ''}`;
    return await api.get(endpoint);
  },

  createStore: async ({ name, email, address, ownerId }) => {
    return await api.post('/admin/stores', { name, email, address, ownerId });
  },

  getStoreOwners: async () => {
    return await api.get('/admin/users?role=STORE_OWNER&limit=100');
  },
};
