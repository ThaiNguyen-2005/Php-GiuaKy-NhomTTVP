import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/student/Home';
import Catalog from './pages/student/Catalog';
import MyBooks from './pages/student/MyBooks';
import Digital from './pages/student/Digital';
import StudentRequests from './pages/student/StudentRequests';
import History from './pages/student/History';
import StudentSettings from './pages/student/StudentSettings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInventory from './pages/admin/AdminInventory';
import AdminRequests from './pages/admin/AdminRequests';
import AdminMembers from './pages/admin/AdminMembers';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import Login from './pages/auth/Login';

export default function App() {
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.member_id) return 'student';
        if (user.librarian_id) return 'admin';
      } catch (e) {}
    }
    return null;
  });

  const handleLogin = (role: 'student' | 'admin') => {
    setUserRole(role);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      
      {/* Student Routes */}
<Route path="/" element={<UserLayout />} >        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="my-books" element={<MyBooks />} />
        <Route path="digital" element={<Digital />} />
        <Route path="requests" element={<StudentRequests />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<StudentSettings />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={userRole === 'admin' ? <AdminLayout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
