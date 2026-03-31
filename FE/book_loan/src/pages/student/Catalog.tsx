import React, { useState, useEffect } from 'react';
import { fetchBooks } from '../../api/bookApi';
import { requestBorrow } from '../../api/borrowApi';
import { FormattedBook } from '../../types/book';

export default function Catalog() {
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [books, setBooks] = useState<FormattedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
     fetchBooks().then(data => {
         setBooks(data);
         setIsLoading(false);
     }).catch(e => {
         console.error(e);
         setIsLoading(false);
     });
  }, []);

  const handleBorrow = async () => {
      try {
          const userStr = localStorage.getItem('user');
          if (!userStr) {
              alert('Bạn cần đăng nhập để mượn sách');
              return;
          }
          const user = JSON.parse(userStr);
          if (!user.member_id) {
              alert('Chỉ sinh viên mới có thể yêu cầu mượn sách');
              return;
          }
          await requestBorrow(user.member_id, selectedBook.id);
          alert('Yêu cầu mượn sách đã được gửi thành công!');
          setSelectedBook(null);
      } catch (e: any) {
          alert(e.message || 'Lỗi khi yêu cầu mượn sách');
      }
  };

  return (
    <div className="flex h-full relative">
      {/* Filters Sidebar */}
      <aside className="w-72 bg-surface-bright border-r border-surface-container-high overflow-y-auto p-6 custom-scrollbar shrink-0">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-on-surface">Bộ lọc</h2>
          <button className="text-xs text-primary font-medium hover:underline">Xóa tất cả</button>
        </div>
        <div className="space-y-8">
          <section>
            <h3 className="text-xs font-bold text-on-surface-variant mb-4 uppercase tracking-widest">Thể loại</h3>
            <div className="space-y-3">
              {['Giáo dục học', 'Tâm lý học', 'Công nghệ thông tin', 'Ngôn ngữ Anh'].map((cat, i) => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked={i === 0} className="w-4 h-4 rounded border-outline text-primary focus:ring-primary" />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">{cat}</span>
                </label>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-xs font-bold text-on-surface-variant mb-4 uppercase tracking-widest">Tác giả</h3>
            <div className="relative">
              <select aria-label="Loc theo tac gia" className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm appearance-none focus:ring-2 focus:ring-primary/20 outline-none">
                <option>Tất cả tác giả</option>
                <option>PGS.TS Nguyễn Văn A</option>
                <option>TS. Trần Thị B</option>
                <option>GS. Lê Văn C</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </section>
          <section>
            <h3 className="text-xs font-bold text-on-surface-variant mb-4 uppercase tracking-widest">Năm xuất bản</h3>
            <div className="relative">
              <select aria-label="Loc theo nam xuat ban" className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm appearance-none focus:ring-2 focus:ring-primary/20 outline-none">
                <option>Tất cả năm</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
                <option>Trước 2020</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">calendar_today</span>
            </div>
          </section>
        </div>
      </aside>

      {/* Book Grid */}
      <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Danh mục sách</h2>
            <p className="text-sm text-on-surface-variant mt-1">Hiển thị {books.length} kết quả</p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl">
            <button className="p-2 bg-surface-bright rounded-lg shadow-sm text-primary">
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-bright transition-colors rounded-lg">
              <span className="material-symbols-outlined">format_list_bulleted</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoading ? (
             <div className="col-span-full text-center py-10">Đang tải biểu mẫu sách...</div>
          ) : books.map((book: any) => (
            <div key={book.id} className={`group cursor-pointer ${book.status === 'Hết sách' ? 'opacity-80' : ''}`} onClick={() => setSelectedBook(book)}>
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-surface-container relative mb-4 transition-transform duration-300 group-hover:-translate-y-2 scholar-shadow">
                <img src={book.cover} alt={book.title} className={`w-full h-full object-cover ${book.status === 'Hết sách' ? 'grayscale-[0.5]' : ''}`} />
                <div className="absolute top-3 right-3">
                  <span className={`${book.statusColor} text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tight`}>{book.status}</span>
                </div>
              </div>
              <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2">{book.title}</h4>
              <p className="text-xs text-on-surface-variant mt-1">{book.author}</p>
              {book.status === 'Hết sách' ? (
                <p className="text-[10px] text-error mt-2 font-medium">Hết sách</p>
              ) : (
                <p className="text-[10px] text-outline mt-2 uppercase">Kệ: {book.location}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-bright w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            <div className="md:w-2/5 bg-surface-container relative">
              <img src={selectedBook.cover} alt={selectedBook.title} className="w-full h-full object-cover" />
              <button onClick={() => setSelectedBook(null)} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/40 transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            </div>
            <div className="md:w-3/5 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary-container px-3 py-1 rounded-full">{selectedBook.category}</span>
                  <h2 className="text-3xl font-bold text-on-surface mt-4">{selectedBook.title}</h2>
                  <p className="text-lg text-on-surface-variant mt-2">{selectedBook.author}</p>
                </div>
                <button onClick={() => setSelectedBook(null)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-3xl">close</span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-surface-container-low p-3 rounded-xl">
                  <p className="text-[10px] text-outline uppercase font-bold">Mã sách</p>
                  <p className="text-sm font-bold text-on-surface">{selectedBook.code}</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl">
                  <p className="text-[10px] text-outline uppercase font-bold">Vị trí kệ</p>
                  <p className="text-sm font-bold text-on-surface">{selectedBook.location}</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl">
                  <p className="text-[10px] text-outline uppercase font-bold">Số trang</p>
                  <p className="text-sm font-bold text-on-surface">{selectedBook.pages} trang</p>
                </div>
              </div>
              <div className="text-sm text-on-surface-variant mb-auto">
                <h3 className="text-on-surface font-bold text-sm mb-2 uppercase tracking-wide">Mô tả tóm tắt</h3>
                <p className="leading-relaxed">{selectedBook.desc}</p>
              </div>
              
              {selectedBook.status !== 'Hết sách' ? (
                <div className="mt-12 pt-6 border-t border-surface-container-high flex items-center justify-between gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-outline font-bold uppercase">Trạng thái tại kho</span>
                    <span className="text-green-600 font-bold flex items-center gap-1 mt-1">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      Sẵn sàng cho mượn
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-6 py-3 rounded-xl border border-outline-variant text-on-surface font-medium hover:bg-surface-container-low transition-colors">
                      Xem mục lục
                    </button>
                    <button onClick={handleBorrow} className="px-8 py-3 rounded-xl bg-tertiary text-white font-bold shadow-lg shadow-tertiary/20 hover:scale-[1.02] transition-transform active:scale-95">
                      Mượn ngay
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-12 pt-6 border-t border-surface-container-high">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-outline font-bold uppercase">Trạng thái tại kho</span>
                    <span className="text-error font-bold flex items-center gap-1 mt-1">
                      <span className="w-2 h-2 bg-error rounded-full"></span>
                      Đang được mượn hết
                    </span>
                  </div>
                  <button className="w-full mt-4 px-8 py-3 rounded-xl bg-surface-container-highest text-on-surface-variant font-bold cursor-not-allowed" disabled>
                    Dự kiến trả: {selectedBook.returnDate}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
