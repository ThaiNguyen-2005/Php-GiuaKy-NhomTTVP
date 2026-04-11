import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { searchBooks } from '../api/bookApi';
import type { FormattedBook } from '../types/book';

export default function Header() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FormattedBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const userName = user?.name || 'Người dùng';
  const userRole = role === 'admin' ? 'Quản trị viên' : 'Sinh viên';

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

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

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-surface-container-high bg-surface-bright/80 px-8 backdrop-blur-md">
      <div className="flex flex-1 items-center" ref={wrapperRef}>
        <div className="relative w-full max-w-xl">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            placeholder="Tìm kiếm tài liệu, giáo trình..."
            className="w-full rounded-full border-none bg-surface-container py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-primary/20"
          />
          {isSearching ? (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-outline">
              Đang tìm...
            </span>
          ) : null}

          {showDropdown ? (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-surface-container-low bg-white shadow-2xl">
              {results.length > 0 ? (
                <>
                  {results.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => {
                        navigate('/catalog');
                        setShowDropdown(false);
                        setQuery('');
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-container-low"
                    >
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="h-10 w-8 shrink-0 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-on-surface">{book.title}</p>
                        <p className="text-xs text-on-surface-variant">{book.author}</p>
                      </div>
                      <span
                        className={`whitespace-nowrap rounded px-2 py-0.5 text-[10px] font-bold text-white ${book.statusColor}`}
                      >
                        {book.status}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      navigate('/catalog');
                      setShowDropdown(false);
                      setQuery('');
                    }}
                    className="w-full border-t border-surface-container-low px-4 py-3 text-center text-xs font-bold text-primary transition-colors hover:bg-primary/5"
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
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden flex-col items-end md:flex">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Thư viện số HCMUE
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low">
            <span className="material-symbols-outlined">notifications</span>
            <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-tertiary" />
          </button>
          <div className="ml-2 flex items-center gap-3 border-l border-surface-container-high pl-4">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-on-surface">{userName}</p>
              <p className="text-[10px] text-on-surface-variant">{userRole}</p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
              alt="Người dùng"
              className="h-9 w-9 rounded-full border border-surface-container-high bg-surface-container-high object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
