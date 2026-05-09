import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function AdminHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<'inventory' | 'members'>('inventory');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    const target = scope === 'members' ? '/admin/members' : '/admin/inventory';
    navigate(`${target}?search=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-surface-container bg-white px-8">
      <div className="flex flex-1 items-center gap-4">
        <form onSubmit={handleSubmit} className="relative hidden w-[32rem] items-center gap-2 md:flex">
          <select
            value={scope}
            onChange={(event) => setScope(event.target.value as 'inventory' | 'members')}
            aria-label="Phạm vi tìm kiếm"
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="inventory">Sách</option>
            <option value="members">Thành viên</option>
          </select>
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              search
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kiếm theo tên, mã hoặc ISBN..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white hover:text-primary"
            >
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full border border-white bg-red-500"></span>
        </button>

        <div className="mx-2 h-6 w-px bg-slate-200"></div>

        <div className="flex cursor-pointer items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-slate-50">
          <div className="hidden text-right sm:block">
            <p className="mb-1 text-sm font-bold leading-none text-slate-700">
              {user?.name || 'Thủ thư'}
            </p>
            <p className="text-[10px] font-medium text-slate-500">
              {user?.email || 'Quản trị viên'}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/10">
            <span className="material-symbols-outlined text-primary">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
