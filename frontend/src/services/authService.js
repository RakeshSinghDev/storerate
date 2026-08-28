import request from './api';

export const authService = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me', { method: 'GET' }),
  updatePassword: (passwords) => request('/auth/password', { method: 'PUT', body: JSON.stringify(passwords) }),
};
