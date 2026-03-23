import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './views/Home';
import Catalog from './views/Catalog';
import MyBooks from './views/MyBooks';
import Digital from './views/Digital';
import StudentRequests from './views/StudentRequests';
import History from './views/History';
import StudentSettings from './views/StudentSettings';
import AdminDashboard from './views/AdminDashboard';
import AdminInventory from './views/AdminInventory';
import AdminRequests from './views/AdminRequests';
import AdminMembers from './views/AdminMembers';
import AdminReports from './views/AdminReports';
import AdminSettings from './views/AdminSettings';
import Login from './views/Login';

export default function App() {
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);

  const handleLogin = (role: 'student' | 'admin') => {
    setUserRole(role);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      
      {/* Student Routes */}
      <Route path="/" element={userRole === 'student' ? <UserLayout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/home" replace />} />
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
