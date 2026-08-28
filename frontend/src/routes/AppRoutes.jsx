import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NormalUserStoresPage from '../pages/NormalUserStoresPage';
import UpdatePasswordPage from '../pages/UpdatePasswordPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import AdminStoresPage from '../pages/AdminStoresPage';
import AdminAddUserPage from '../pages/AdminAddUserPage';
import AdminAddStorePage from '../pages/AdminAddStorePage';
import StoreOwnerDashboardPage from '../pages/StoreOwnerDashboardPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/stores" element={<NormalUserStoresPage />} />

      {/* Authenticated Routes - All Roles */}
      <Route
        path="/update-password"
        element={
          <ProtectedRoute>
            <UpdatePasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['SYSTEM_ADMINISTRATOR']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['SYSTEM_ADMINISTRATOR']}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/new"
        element={
          <ProtectedRoute allowedRoles={['SYSTEM_ADMINISTRATOR']}>
            <AdminAddUserPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores"
        element={
          <ProtectedRoute allowedRoles={['SYSTEM_ADMINISTRATOR']}>
            <AdminStoresPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores/new"
        element={
          <ProtectedRoute allowedRoles={['SYSTEM_ADMINISTRATOR']}>
            <AdminAddStorePage />
          </ProtectedRoute>
        }
      />

      {/* Store Owner Routes */}
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STORE_OWNER']}>
            <StoreOwnerDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
