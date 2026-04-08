import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { path: '/home', icon: 'home', label: 'Trang chu' },
  { path: '/catalog', icon: 'search', label: 'Tim kiem sach' },
  { path: '/digital', icon: 'menu_book', label: 'Tai lieu so' },
  { path: '/my-books', icon: 'library_books', label: 'Sach cua toi' },
  { path: '/requests', icon: 'pending_actions', label: 'Yeu cau muon' },
  { path: '/history', icon: 'history', label: 'Lich su' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 flex flex-col h-full bg-surface-bright border-r border-surface-container-high z-30 shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
          <span className="material-symbols-outlined filled">school</span>
        </div>
        <div>
          <h1 className="font-bold text-sm leading-tight text-primary">HCMUE Library</h1>
          <p className="text-[10px] text-on-surface-variant tracking-wider uppercase">Digital System</p>
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
                  : 'text-on-surface-variant hover:bg-surface-container-low font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <React.Fragment>
                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </React.Fragment>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-surface-container-high space-y-1">
        <NavLink 
          to="/settings"
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive
                ? 'bg-primary text-white font-medium'
                : 'text-on-surface-variant hover:bg-surface-container-low font-medium'
            }`
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm">Cai dat</span>
        </NavLink>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-error hover:bg-red-50"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm font-medium">Dang xuat</span>
        </button>
      </div>
    </aside>
  );
}
