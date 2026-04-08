import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { UserRole } from '../auth/storage';

export default function ProtectedRoute({ role }: { role?: UserRole }) {
  const { isAuthenticated, role: currentRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && currentRole !== role) {
    return <Navigate to={currentRole === 'admin' ? '/admin/dashboard' : '/home'} replace />;
  }

  return <Outlet />;
}
