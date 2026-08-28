import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const RoleRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect unauthorized user to their respective default home dashboard
    if (user?.role === 'SYSTEM_ADMINISTRATOR') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'STORE_OWNER') {
      return <Navigate to="/owner/dashboard" replace />;
    } else {
      return <Navigate to="/stores" replace />;
    }
  }

  return <Outlet />;
};
