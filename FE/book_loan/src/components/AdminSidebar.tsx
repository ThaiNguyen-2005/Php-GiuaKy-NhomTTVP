import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { path: '/admin/dashboard', icon: 'dashboard', label: 'Tong quan' },
  { path: '/admin/inventory', icon: 'inventory', label: 'Quan ly kho sach' },
  { path: '/admin/requests', icon: 'pending_actions', label: 'Duyet muon sach' },
  { path: '/admin/members', icon: 'group', label: 'Thanh vien' },
  { path: '/admin/reports', icon: 'bar_chart', label: 'Bao cao thong ke' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 flex flex-col h-full bg-slate-900 border-r border-slate-800 z-30 shrink-0 text-slate-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
          <span className="material-symbols-outlined filled">admin_panel_settings</span>
        </div>
        <div>
          <h1 className="font-bold text-sm leading-tight text-white">HCMUE Admin</h1>
          <p className="text-[10px] text-slate-400 tracking-wider uppercase">Librarian Panel</p>
        </div>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-primary text-white font-medium'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 space-y-1">
        <NavLink 
          to="/admin/settings"
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive
                ? 'bg-primary text-white font-medium'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 font-medium'
            }`
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm">Cai dat he thong</span>
        </NavLink>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-red-400 hover:bg-red-500/10 mt-1"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm font-medium">Dang xuat</span>
        </button>
      </div>
    </aside>
  );
}
