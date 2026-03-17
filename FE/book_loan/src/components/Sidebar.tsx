import React from 'react';

const navItems = [
  { id: 'home', icon: 'home', label: 'Trang chủ' },
  { id: 'catalog', icon: 'search', label: 'Tìm kiếm sách' },
  { id: 'digital', icon: 'menu_book', label: 'Tài liệu số' },
  { id: 'my-books', icon: 'library_books', label: 'Sách của tôi' },
  { id: 'requests', icon: 'pending_actions', label: 'Yêu cầu mượn' },
  { id: 'history', icon: 'history', label: 'Lịch sử' },
];

export default function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (id: string) => void }) {
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
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === item.id
                ? 'bg-primary text-white font-medium'
                : 'text-on-surface-variant hover:bg-surface-container-low font-medium'
            }`}
          >
            <span className={`material-symbols-outlined ${activeTab === item.id ? 'filled' : ''}`}>{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-surface-container-high space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-on-surface-variant hover:bg-surface-container-low">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm font-medium">Cài đặt</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-error hover:bg-red-50">
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
