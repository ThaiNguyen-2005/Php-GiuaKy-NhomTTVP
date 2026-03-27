import React from 'react';

const mockHistory = [
    { id: 'H-9182', book: 'Toán rời rạc', author: 'Kenneth H. Rosen', borrowDate: '01/02/2026', returnDate: '15/02/2026', status: 'Đúng hạn', color: 'text-green-600 bg-green-50' },
    { id: 'H-9012', book: 'Clean Code', author: 'Robert C. Martin', borrowDate: '10/01/2026', returnDate: '28/01/2026', status: 'Trễ hạn (3 ngày)', color: 'text-tertiary bg-tertiary-container' },
    { id: 'H-8821', book: 'Nhập môn Cơ sở dữ liệu', author: 'Date C.J.', borrowDate: '15/12/2025', returnDate: '28/12/2025', status: 'Đúng hạn', color: 'text-green-600 bg-green-50' },
];

export default function History() {
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Lịch sử mượn trả</h2>
          <p className="text-on-surface-variant text-sm mt-1">Danh sách chi tiết các tài liệu bạn đã từng mượn tại thư viện</p>
        </div>
        <button className="px-5 py-2 border border-surface-container-high rounded-xl text-sm font-semibold hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span> Xuất PDF
        </button>
      </div>

      <div className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low overflow-hidden">
        <table className="w-full text-left min-w-[700px]">
            <thead>
                <tr className="bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-surface-container">
                    <th className="px-6 py-4">Mã giao dịch</th>
                    <th className="px-6 py-4">Tài liệu</th>
                    <th className="px-6 py-4 text-center">Ngày mượn</th>
                    <th className="px-6 py-4 text-center">Ngày trả</th>
                    <th className="px-6 py-4 text-right">Trạng thái hoàn tất</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
                {mockHistory.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                            <span className="text-xs font-mono font-bold text-slate-500">{item.id}</span>
                        </td>
                        <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-800">{item.book}</p>
                            <p className="text-xs text-slate-500">{item.author}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className="text-sm font-medium text-slate-700">{item.borrowDate}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className="text-sm font-medium text-slate-700">{item.returnDate}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${item.color}`}>
                                {item.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        {/* Empty state example (commented out) 
        <div className="p-12 flex flex-col items-center justify-center text-center opacity-50">
            <span className="material-symbols-outlined text-6xl mb-4">history</span>
            <p className="font-bold text-lg">Chưa có lịch sử</p>
            <p className="text-sm">Bạn chưa từng mượn cuốn sách nào.</p>
        </div>
        */}
      </div>
    </div>
  );
}
