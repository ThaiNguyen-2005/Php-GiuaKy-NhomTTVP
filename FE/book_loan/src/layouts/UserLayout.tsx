import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function UserLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
