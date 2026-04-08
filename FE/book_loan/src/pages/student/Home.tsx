import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBooks } from '../../api/bookApi';
import { FormattedBook } from '../../types/book';

export default function Home() {
  const navigate = useNavigate();
  const [newBooks, setNewBooks] = useState<FormattedBook[]>([]);

  useEffect(() => {
    fetchBooks()
      .then((data) => {
        setNewBooks(data.slice(0, 5));
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-10 p-8">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div
          className="group flex cursor-pointer items-center justify-between rounded-xl bg-primary-container p-6 scholar-shadow transition-transform hover:-translate-y-1"
          onClick={() => navigate('/my-books')}
        >
          <div>
            <p className="mb-1 text-sm font-medium text-on-primary-container/80">Sách đang mượn</p>
            <h3 className="text-4xl font-bold text-on-primary-container">04</h3>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-on-primary-container/10">
            <span className="material-symbols-outlined text-3xl text-on-primary-container">
              auto_stories
            </span>
          </div>
        </div>
        <div
          className="group flex cursor-pointer items-center justify-between rounded-xl bg-tertiary-container p-6 scholar-shadow transition-transform hover:-translate-y-1"
          onClick={() => navigate('/my-books')}
        >
          <div>
            <p className="mb-1 text-sm font-medium text-on-tertiary-container/80">Sách quá hạn</p>
            <h3 className="text-4xl font-bold text-on-tertiary-container">01</h3>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-on-tertiary-container/10">
            <span className="material-symbols-outlined text-3xl text-on-tertiary-container">
              event_busy
            </span>
          </div>
        </div>
        <div className="group flex cursor-pointer items-center justify-between rounded-xl bg-surface-bright p-6 scholar-shadow transition-transform hover:-translate-y-1">
          <div>
            <p className="mb-1 text-sm font-medium text-on-surface-variant">Sách yêu thích</p>
            <h3 className="text-4xl font-bold text-on-surface">12</h3>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-container">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">
              favorite
            </span>
          </div>
        </div>
      </section>

      <section className="scholar-shadow relative h-[320px] overflow-hidden rounded-xl">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-primary to-primary/40"></div>
        <img
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000"
          alt="Library"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative z-20 flex h-full max-w-2xl flex-col justify-center p-12 text-white">
          <span className="mb-4 inline-block w-fit rounded bg-tertiary px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
            Sách hay của tháng
          </span>
          <h2 className="mb-4 text-5xl font-bold leading-tight">
            Nghệ Thuật Của Tư Duy Rành Mạch
          </h2>
          <p className="mb-8 text-lg opacity-90 text-primary-container">
            Khám phá 99 sai lầm nhận thức phổ biến và cách để đưa ra những quyết định
            sáng suốt hơn mỗi ngày.
          </p>
          <div className="flex gap-4">
            <button className="rounded-lg bg-white px-6 py-3 font-bold text-primary transition-colors hover:bg-surface-container">
              Mượn ngay
            </button>
            <button className="rounded-lg border border-white/30 bg-white/20 px-6 py-3 font-medium text-white backdrop-blur-md transition-colors hover:bg-white/30">
              Xem chi tiết
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-on-surface">Sách mới về</h3>
          <button
            onClick={() => navigate('/catalog')}
            className="flex items-center gap-1 font-medium text-primary hover:underline"
          >
            Xem tất cả <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {newBooks.map((book) => (
            <div
              key={book.id}
              className="group flex cursor-pointer flex-col"
              onClick={() => navigate('/catalog')}
            >
              <div className="scholar-shadow relative aspect-[3/4] overflow-hidden rounded-lg transition-transform duration-300 group-hover:-translate-y-2">
                <img
                  src={book.cover}
                  alt={book.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <div className="absolute right-3 top-3">
                  <span
                    className={`${book.statusColor} rounded px-2 py-1 text-[10px] font-bold uppercase text-white shadow-lg`}
                  >
                    {book.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <h4 className="line-clamp-1 font-bold leading-snug text-on-surface transition-colors group-hover:text-primary">
                  {book.title}
                </h4>
                <p className="line-clamp-1 text-sm text-on-surface-variant">{book.author}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="material-symbols-outlined text-xs text-primary">location_on</span>
                  <span className="text-[10px] font-medium uppercase tracking-tighter text-primary">
                    {book.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-surface-container-high pt-8 text-sm text-on-surface-variant md:flex-row">
        <p>© 2024 Ho Chi Minh City University of Education Digital Library. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="transition-colors hover:text-primary">Điều khoản mượn trả</a>
          <a href="#" className="transition-colors hover:text-primary">Chính sách bảo mật</a>
          <a href="#" className="transition-colors hover:text-primary">Hỗ trợ sinh viên</a>
        </div>
      </footer>
    </div>
  );
}
