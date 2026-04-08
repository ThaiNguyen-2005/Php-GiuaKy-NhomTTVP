import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import PageLoader from './components/PageLoader';
import ProtectedRoute from './components/ProtectedRoute';

const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const UserLayout = lazy(() => import('./layouts/UserLayout'));
const Login = lazy(() => import('./pages/auth/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminMembers = lazy(() => import('./pages/admin/AdminMembers'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminRequests = lazy(() => import('./pages/admin/AdminRequests'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const Catalog = lazy(() => import('./pages/student/Catalog'));
const Digital = lazy(() => import('./pages/student/Digital'));
const History = lazy(() => import('./pages/student/History'));
const Home = lazy(() => import('./pages/student/Home'));
const MyBooks = lazy(() => import('./pages/student/MyBooks'));
const StudentRequests = lazy(() => import('./pages/student/StudentRequests'));
const StudentSettings = lazy(() => import('./pages/student/StudentSettings'));

export default function App() {
  const { isAuthenticated, role } = useAuth();
  const homePath = role === 'admin' ? '/admin/dashboard' : '/home';

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to={homePath} replace /> : <Login />} />

        <Route element={<ProtectedRoute role="student" />}>
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="my-books" element={<MyBooks />} />
            <Route path="digital" element={<Digital />} />
            <Route path="requests" element={<StudentRequests />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<StudentSettings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? homePath : '/login'} replace />} />
      </Routes>
    </Suspense>
  );
}
