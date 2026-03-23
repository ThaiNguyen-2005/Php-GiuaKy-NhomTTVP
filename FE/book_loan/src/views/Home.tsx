import React from 'react';
import { useNavigate } from 'react-router-dom';

const newBooks = [
  { id: 1, title: 'Tâm Lý Học Về Tiền', author: 'Morgan Housel', location: 'Khu B - Kệ 01', status: 'Còn', cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400', color: 'bg-green-500' },
  { id: 2, title: 'Lược Sử Thời Gian', author: 'Stephen Hawking', location: 'Khu A - Kệ 05', status: 'Hết', cover: 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?auto=format&fit=crop&q=80&w=400', color: 'bg-error' },
  { id: 3, title: 'Nhà Giả Kim', author: 'Paulo Coelho', location: 'Khu B - Kệ 01', status: 'Còn', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400', color: 'bg-green-500' },
  { id: 4, title: 'Atomic Habits', author: 'James Clear', location: 'Khu C - Kệ 12', status: 'Còn', cover: 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=400', color: 'bg-green-500' },
  { id: 5, title: 'Dế Mèn Phiêu Lưu Ký', author: 'Tô Hoài', location: 'Khu A - Kệ 01', status: 'Hết', cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400', color: 'bg-error' },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="p-8 space-y-10">
      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary-container p-6 rounded-xl flex items-center justify-between scholar-shadow group hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => navigate('/my-books')}>
          <div>
            <p className="text-sm text-on-primary-container/80 mb-1 font-medium">Sách đang mượn</p>
            <h3 className="text-4xl font-bold text-on-primary-container">04</h3>
          </div>
          <div className="w-14 h-14 rounded-lg bg-on-primary-container/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-3xl">auto_stories</span>
          </div>
        </div>
        <div className="bg-tertiary-container p-6 rounded-xl flex items-center justify-between scholar-shadow group hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => navigate('/my-books')}>
          <div>
            <p className="text-sm text-on-tertiary-container/80 mb-1 font-medium">Sách quá hạn</p>
            <h3 className="text-4xl font-bold text-on-tertiary-container">01</h3>
          </div>
          <div className="w-14 h-14 rounded-lg bg-on-tertiary-container/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-tertiary-container text-3xl">event_busy</span>
          </div>
        </div>
        <div className="bg-surface-bright p-6 rounded-xl flex items-center justify-between scholar-shadow group hover:-translate-y-1 transition-transform cursor-pointer">
          <div>
            <p className="text-sm text-on-surface-variant mb-1 font-medium">Sách yêu thích</p>
            <h3 className="text-4xl font-bold text-on-surface">12</h3>
          </div>
          <div className="w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-3xl">favorite</span>
          </div>
        </div>
      </section>

      {/* Hero Banner */}
      <section className="relative h-[320px] rounded-xl overflow-hidden scholar-shadow">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000" 
          alt="Library" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 h-full p-12 flex flex-col justify-center max-w-2xl text-white">
          <span className="inline-block px-3 py-1 bg-tertiary text-[10px] font-bold uppercase tracking-widest rounded mb-4 w-fit">Sách hay của tháng</span>
          <h2 className="text-5xl font-bold mb-4 leading-tight">Nghệ Thuật Của Tư Duy Rành Mạch</h2>
          <p className="text-lg text-primary-container mb-8 opacity-90">Khám phá 99 sai lầm nhận thức phổ biến và cách để đưa ra những quyết định sáng suốt hơn mỗi ngày.</p>
          <div className="flex gap-4">
             <button className="bg-white text-primary px-6 py-3 rounded-lg font-bold hover:bg-surface-container transition-colors">Mượn ngay</button>
             <button className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors">Xem chi tiết</button>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-on-surface">Sách mới về</h3>
          <button onClick={() => navigate('/catalog')} className="text-primary font-medium hover:underline flex items-center gap-1">
            Xem tất cả <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {newBooks.map(book => (
             <div key={book.id} className="flex flex-col group cursor-pointer" onClick={() => navigate('/catalog')}>
              <div className="aspect-[3/4] relative rounded-lg overflow-hidden scholar-shadow transition-transform duration-300 group-hover:-translate-y-2">
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3">
                  <span className={`${book.color} text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase`}>{book.status}</span>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <h4 className="font-bold text-on-surface leading-snug group-hover:text-primary transition-colors line-clamp-1">{book.title}</h4>
                <p className="text-sm text-on-surface-variant line-clamp-1">{book.author}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="material-symbols-outlined text-xs text-primary">location_on</span>
                  <span className="text-[10px] font-medium text-primary uppercase tracking-tighter">{book.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <footer className="mt-12 pt-8 border-t border-surface-container-high text-on-surface-variant text-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2024 Ho Chi Minh City University of Education Digital Library. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Điều khoản mượn trả</a>
          <a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a>
          <a href="#" className="hover:text-primary transition-colors">Hỗ trợ sinh viên</a>
        </div>
      </footer>
    </div>
  );
}
