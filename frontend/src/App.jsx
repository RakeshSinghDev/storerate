import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AuthenticatedLayout } from './layouts/AuthenticatedLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

// Public Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PasswordUpdate } from './pages/PasswordUpdate';

// Normal User Experience Pages
import { StoresPage } from './pages/StoresPage';
import { StoreDetailsPage } from './pages/StoreDetailsPage';

// System Administrator Pages
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminUserDetailsPage } from './pages/AdminUserDetailsPage';
import { AdminStoresPage } from './pages/AdminStoresPage';

// Store Owner Pages
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { OwnerRatingsPage } from './pages/OwnerRatingsPage';

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AuthenticatedLayout />}>
              <Route path="/password" element={<PasswordUpdate />} />

              {/* Normal User Routes */}
              <Route element={<RoleRoute allowedRoles={['NORMAL_USER']} />}>
                <Route path="/stores" element={<StoresPage />} />
                <Route path="/stores/:id" element={<StoreDetailsPage />} />
              </Route>

              {/* System Administrator Routes */}
              <Route element={<RoleRoute allowedRoles={['SYSTEM_ADMINISTRATOR']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/users/:id" element={<AdminUserDetailsPage />} />
                <Route path="/admin/stores" element={<AdminStoresPage />} />
              </Route>

              {/* Store Owner Routes */}
              <Route element={<RoleRoute allowedRoles={['STORE_OWNER']} />}>
                <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
                <Route path="/owner/ratings" element={<OwnerRatingsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-All Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
