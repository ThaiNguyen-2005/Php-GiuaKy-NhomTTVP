import React from 'react';

export default function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-surface-bright/80 backdrop-blur-md border-b border-surface-container-high sticky top-0 z-20 shrink-0">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm tài liệu, giáo trình..." 
            className="w-full bg-surface-container border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-outline transition-all outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs font-semibold text-primary tracking-wider uppercase">Thư viện số HCMUE</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-tertiary rounded-full"></span>
          </button>
          <button className="relative p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <div className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full"></div>
          </button>
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-surface-container-high">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-on-surface">Nguyễn Văn A</p>
              <p className="text-[10px] text-on-surface-variant">Sinh viên</p>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" 
              alt="User" 
              className="w-9 h-9 rounded-full bg-surface-container-high border border-surface-container-high object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
