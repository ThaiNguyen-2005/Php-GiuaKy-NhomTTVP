import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { UserRole } from '../auth/storage';
import PageLoader from './PageLoader';

export default function ProtectedRoute({ role }: { role?: UserRole }) {
  const { isAuthReady, isAuthenticated, role: currentRole } = useAuth();

  if (!isAuthReady) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && currentRole !== role) {
    return <Navigate to={currentRole === 'admin' ? '/admin/dashboard' : '/home'} replace />;
  }

  return <Outlet />;
}
