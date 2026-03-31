import React, { useState, useEffect } from 'react';
import { getMemberRequests } from '../../api/borrowApi';

export default function MyBooks() {
  const [activeTab, setActiveTab] = useState<'borrowed' | 'history'>('borrowed');
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);
  const [historyBooks, setHistoryBooks] = useState<any[]>([]);

  useEffect(() => {
     const userStr = localStorage.getItem('user');
     if (userStr) {
         const user = JSON.parse(userStr);
         if (user.member_id) {
             getMemberRequests(user.member_id).then(data => {
                 const borrowed = data.filter((req: any) => req.status === 'borrowed');
                 const mapped = borrowed.map((req: any) => {
                     const borrowDate = new Date(req.borrow_date);
                     const dueDate = new Date(borrowDate);
                     dueDate.setDate(dueDate.getDate() + 14); // Giả lập hạn mượn 14 ngày
                     const diffDays = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                     
                     return {
                         id: req.id,
                         title: req.bookTitle,
                         author: req.author,
                         type: req.category,
                         typeColor: diffDays <= 3 ? 'text-tertiary' : 'text-primary',
                         cover: req.cover,
                         borrowDate: borrowDate.toLocaleDateString('vi-VN'),
                         dueDate: dueDate.toLocaleDateString('vi-VN'),
                         daysLeft: diffDays,
                         isWarning: diffDays <= 3
                     };
                 });
                 setBorrowedBooks(mapped);
                 const history = data.filter((req: any) => req.status === 'returned');
                 const mappedHistory = history.map((req: any) => ({
                    id: req.id,
                    title: req.bookTitle,
                    author: req.author,
                    type: req.category,
                    cover: req.cover,
                    borrowDate: new Date(req.borrow_date).toLocaleDateString('vi-VN'),
                    returnDate: new Date(req.return_date).toLocaleDateString('vi-VN')
                 }));
                 setHistoryBooks(mappedHistory);
             }).catch(console.error);
         }
     }
  }, []);

  return (
    <div className="p-8">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Sách của tôi</h2>
          <p className="text-on-surface-variant mt-1">Quản lý và theo dõi quá trình mượn trả tài liệu của bạn.</p>
        </div>
        <div className="flex gap-2 p-1 bg-surface-container-low w-fit rounded-xl">
          <button 
            onClick={() => setActiveTab('borrowed')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${activeTab === 'borrowed' ? 'bg-surface-bright scholar-shadow text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-sm">auto_stories</span>
            Sách đang mượn
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${activeTab === 'history' ? 'bg-surface-bright scholar-shadow text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-sm">history_edu</span>
            Lịch sử mượn
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Alert Banner */}
          <div className="bg-tertiary-container rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between scholar-shadow gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-tertiary/10 rounded-full flex items-center justify-center text-tertiary shrink-0">
                <span className="material-symbols-outlined filled">warning</span>
              </div>
              <div>
                <h4 className="font-bold text-on-tertiary-container">Sắp hết hạn mượn!</h4>
                <p className="text-sm text-on-tertiary-container opacity-80 mt-1">Cuốn "Ngôn ngữ học đại cương" còn 2 ngày nữa là đến hạn trả.</p>
              </div>
            </div>
            <button className="px-5 py-2 bg-tertiary text-white rounded-lg text-sm font-semibold hover:bg-on-tertiary-container transition-colors shrink-0">
              Xử lý ngay
            </button>
          </div>

          {/* Books Grid */}
          {activeTab === 'borrowed' ? (
              borrowedBooks.length === 0 ? (
                <div className="bg-surface-bright rounded-xl scholar-shadow p-12 text-center border border-dashed border-surface-container-high">
                  <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">auto_stories</span>
                  <h3 className="text-lg font-bold text-on-surface mb-2">Không có cuốn sách nào</h3>
                  <p className="text-on-surface-variant text-sm max-w-sm mx-auto">Bạn hiện không có cuốn sách nào đang mượn. Hãy ghé thăm danh mục để tìm mượn những cuốn sách thú vị nhé.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {borrowedBooks.map(book => (
                    <div key={book.id} className={`bg-surface-bright rounded-xl scholar-shadow p-5 transition-all flex flex-col gap-4 border-2 ${book.isWarning ? 'border-tertiary/20' : 'border-transparent hover:-translate-y-1'}`}>
                      <div className="flex gap-4">
                        <div className="w-24 aspect-[3/4] bg-surface-container rounded-lg overflow-hidden shrink-0">
                          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col justify-between">
                          <div>
                            <span className={`text-[10px] font-bold ${book.typeColor} uppercase tracking-wider`}>{book.type}</span>
                            <h3 className="font-bold text-sm text-on-surface line-clamp-2 mt-1">{book.title}</h3>
                            <p className="text-xs text-on-surface-variant mt-1">{book.author}</p>
                          </div>
                          <div className="mt-4">
                            <div className={`flex items-center gap-1 font-bold ${book.isWarning ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                              <span className="material-symbols-outlined text-xs">timer</span>
                              <span className="text-xs">Còn {book.daysLeft} ngày</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-outline-variant flex items-center justify-between">
                        <div className="text-[10px] text-on-surface-variant">
                          <p>Mượn: {book.borrowDate}</p>
                          <p>Hạn: {book.dueDate}</p>
                        </div>
                        <button className="px-4 py-2 bg-primary-container text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all">Gia hạn</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
          ) : (
              historyBooks.length === 0 ? (
                <div className="bg-surface-bright rounded-xl scholar-shadow p-12 text-center border border-dashed border-surface-container-high">
                  <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">history</span>
                  <h3 className="text-lg font-bold text-on-surface mb-2">Lịch sử trống</h3>
                  <p className="text-on-surface-variant text-sm max-w-sm mx-auto">Bạn chưa từng mượn và trả cuốn sách nào cả.</p>
                </div>
              ) : (
                <div className="bg-surface-bright rounded-xl scholar-shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-surface-container-low text-xs uppercase tracking-widest text-on-surface-variant">
                            <tr>
                                <th className="px-6 py-4">Tên sách</th>
                                <th className="px-6 py-4">Ngày mượn</th>
                                <th className="px-6 py-4">Ngày trả</th>
                                <th className="px-6 py-4">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-low">
                            {historyBooks.map((book) => (
                                <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-sm">{book.title}</p>
                                        <p className="text-xs text-on-surface-variant">{book.author}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">{book.borrowDate}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{book.returnDate}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-surface-container text-[10px] font-bold uppercase rounded">Đã trả</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              )
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-8">
          {/* Quota */}
          <div className="bg-surface-bright rounded-xl scholar-shadow p-6">
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-on-surface-variant">Hạn mức mượn</h4>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold text-primary">3/5</span>
              <span className="text-xs text-on-surface-variant mb-1">Quyển sách</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-[60%]"></div>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-4 leading-relaxed">
              Bạn còn có thể mượn tối đa 2 cuốn sách nữa theo quy định của thư viện.
            </p>
          </div>

          {/* Promo Banner */}
          <div className="relative rounded-xl overflow-hidden scholar-shadow bg-primary p-6 text-white min-h-[200px] flex flex-col justify-end">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=400" alt="Promo" className="absolute inset-0 w-full h-full object-cover opacity-40" />
            <div className="relative z-20">
              <span className="bg-tertiary text-[10px] font-bold px-2 py-0.5 rounded mb-2 inline-block">MỚI</span>
              <h4 className="font-bold text-lg leading-tight">Gia hạn trực tuyến cực nhanh</h4>
              <p className="text-xs opacity-80 mt-2">Hệ thống gia hạn tự động giúp bạn tiết kiệm thời gian đến thư viện.</p>
              <button className="mt-4 text-xs font-bold underline underline-offset-4 hover:text-primary-container transition-colors">Tìm hiểu thêm</button>
            </div>
          </div>

          {/* Quick Support */}
          <div className="bg-surface-container-low rounded-xl p-6">
            <h4 className="font-bold text-sm mb-4 text-on-surface uppercase tracking-wider">Hỗ trợ nhanh</h4>
            <div className="space-y-4">
              <a href="#" className="flex items-center gap-3 text-sm text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">help</span>
                Quy trình trả sách
              </a>
              <a href="#" className="flex items-center gap-3 text-sm text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">mail</span>
                Gửi phản hồi
              </a>
              <a href="#" className="flex items-center gap-3 text-sm text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">description</span>
                Nội quy thư viện
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
