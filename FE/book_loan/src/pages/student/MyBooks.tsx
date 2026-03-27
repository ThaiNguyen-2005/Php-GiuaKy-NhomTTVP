import React from 'react';

const borrowedBooks = [
  { id: 1, title: 'Ngôn ngữ học đại cương', author: 'Ferdinand de Saussure', type: 'Cảnh báo', typeColor: 'text-tertiary', cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400', borrowDate: '12/10/2023', dueDate: '26/10/2023', daysLeft: 2, isWarning: true },
  { id: 2, title: 'Tâm lý học giáo dục hiện đại', author: 'TS. Nguyễn Thu Hà', type: 'Tài liệu tham khảo', typeColor: 'text-primary', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400', borrowDate: '15/10/2023', dueDate: '05/11/2023', daysLeft: 12, isWarning: false },
  { id: 3, title: 'Kỹ thuật Vi xử lý & Hệ thống nhúng', author: 'ThS. Lê Văn B', type: 'Kỹ thuật số', typeColor: 'text-primary', cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400', borrowDate: '20/10/2023', dueDate: '15/11/2023', daysLeft: 18, isWarning: false },
];

export default function MyBooks() {
  return (
    <div className="p-8">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Sách của tôi</h2>
          <p className="text-on-surface-variant mt-1">Quản lý và theo dõi quá trình mượn trả tài liệu của bạn.</p>
        </div>
        <div className="flex gap-2 p-1 bg-surface-container-low w-fit rounded-xl">
          <button className="px-6 py-2.5 bg-surface-bright scholar-shadow rounded-lg text-sm font-semibold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">auto_stories</span>
            Sách đang mượn
          </button>
          <button className="px-6 py-2.5 text-on-surface-variant hover:text-on-surface text-sm font-medium flex items-center gap-2 transition-colors">
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
