import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { getToken, setToken, removeToken } from '../utils/token';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        logout();
      }
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const existingToken = getToken();
    if (existingToken) {
      setTokenState(existingToken);
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data?.token) {
      const jwtToken = res.data.token;
      setToken(jwtToken);
      setTokenState(jwtToken);
      const userProfile = res.data.user;
      setUser(userProfile);
      return userProfile;
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const register = async ({ name, email, password, address }) => {
    const res = await api.post('/auth/register', { name, email, password, address });
    return res;
  };

  const updatePassword = async (currentPassword, newPassword) => {
    const res = await api.put('/auth/password', { currentPassword, newPassword });
    return res;
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    updatePassword,
    logout,
    refreshUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
