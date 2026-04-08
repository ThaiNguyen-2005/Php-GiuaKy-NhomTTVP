import React from 'react';
import { useAuth } from '../auth/AuthContext';

export default function AdminHeader() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-surface-container flex items-center justify-between px-8 z-20 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96 hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input 
            type="text" 
            placeholder="Tim kiem sinh vien, ISBN sach..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="w-px h-6 bg-slate-200 mx-2"></div>
        
        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-700 leading-none mb-1">{user?.name || 'Thu thu'}</p>
            <p className="text-[10px] text-slate-500 font-medium">{user?.email || 'Quan tri vien'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
             <span className="material-symbols-outlined text-primary">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
