import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchBooks } from '../api/bookApi';

export default function Header() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const timeoutRef = useRef<any>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
    })();
    const userName = user.name || 'Người dùng';
    const userRole = user.member_id ? 'Sinh viên' : 'Quản trị viên';

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setShowDropdown(false);
            return;
        }
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const data = await searchBooks(query);
                setResults(data.slice(0, 6));
                setShowDropdown(true);
            } catch {
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 400);
        return () => clearTimeout(timeoutRef.current);
    }, [query]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <header className="h-16 flex items-center justify-between px-8 bg-surface-bright/80 backdrop-blur-md border-b border-surface-container-high sticky top-0 z-20 shrink-0">
            <div className="flex items-center flex-1 max-w-xl" ref={wrapperRef}>
                <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onFocus={() => results.length > 0 && setShowDropdown(true)}
                        placeholder="Tìm kiếm tài liệu, giáo trình..."
                        className="w-full bg-surface-container border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-outline transition-all outline-none"
                    />
                    {isSearching && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-outline">Đang tìm...</span>
                    )}

                    {/* Dropdown */}
                    {showDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-surface-container-low overflow-hidden z-50">
                            {results.length > 0 ? (
                                <>
                                    {results.map(book => (
                                        <button
                                            key={book.id}
                                            onClick={() => { navigate('/catalog'); setShowDropdown(false); setQuery(''); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-left"
                                        >
                                            <img src={book.cover} alt={book.title} className="w-8 h-10 object-cover rounded shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-on-surface truncate">{book.title}</p>
                                                <p className="text-xs text-on-surface-variant">{book.author}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${book.statusColor} text-white whitespace-nowrap`}>
                                                {book.status}
                                            </span>
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => { navigate('/catalog'); setShowDropdown(false); setQuery(''); }}
                                        className="w-full px-4 py-3 text-xs font-bold text-primary text-center border-t border-surface-container-low hover:bg-primary/5 transition-colors"
                                    >
                                        Xem tất cả kết quả trong Danh mục →
                                    </button>
                                </>
                            ) : query.trim() ? (
                                <div className="px-4 py-6 text-center text-sm text-on-surface-variant">
                                    Không tìm thấy sách cho "<span className="font-bold text-on-surface">{query}</span>"
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-semibold text-primary tracking-wider uppercase">Thư viện số HCMUE</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                        <div className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full"></div>
                    </button>
                    <div className="flex items-center gap-3 ml-2 pl-4 border-l border-surface-container-high">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-on-surface">{userName}</p>
                            <p className="text-[10px] text-on-surface-variant">{userRole}</p>
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
