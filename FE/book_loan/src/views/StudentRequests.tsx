import React from 'react';

const mockRequests = [
    { id: 'REQ-2024-001', book: 'Nghệ thuật Tư duy Rành mạch', author: 'Rolf Dobelli', date: '22/03/2026', status: 'Chờ duyệt', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { id: 'REQ-2024-002', book: 'Sapiens: Lược sử loài người', author: 'Yuval Noah Harari', date: '20/03/2026', status: 'Đã duyệt', color: 'text-green-600 bg-green-50 border-green-200' },
    { id: 'REQ-2024-003', book: 'Đắc Nhân Tâm', author: 'Dale Carnegie', date: '15/03/2026', status: 'Từ chối', color: 'text-red-600 bg-red-50 border-red-200' }
];

export default function StudentRequests() {
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Yêu cầu mượn sách</h2>
          <p className="text-on-surface-variant text-sm mt-1">Theo dõi quá trình phê duyệt các đơn mượn sách của bạn</p>
        </div>
        <button className="bg-primary text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span> Yêu cầu mới
        </button>
      </div>

      <div className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low overflow-hidden">
        <div className="p-4 border-b border-surface-container bg-slate-50 flex items-center justify-between">
            <div className="flex gap-4 text-sm font-medium">
                <span className="text-primary font-bold border-b-2 border-primary pb-1">Tất cả yêu cầu</span>
                <span className="text-slate-500 hover:text-slate-800 cursor-pointer">Chờ duyệt (1)</span>
                <span className="text-slate-500 hover:text-slate-800 cursor-pointer">Cần nhận sách (1)</span>
            </div>
        </div>

        <div className="divide-y divide-surface-container">
            {mockRequests.map(req => (
                <div key={req.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{req.id}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${req.color}`}>
                                {req.status}
                            </span>
                        </div>
                        <h4 className="text-lg font-bold text-on-surface">{req.book}</h4>
                        <p className="text-sm text-outline mt-1">{req.author}</p>
                    </div>

                    <div className="flex gap-8 items-center md:justify-end">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Ngày yêu cầu</p>
                            <p className="text-sm font-medium text-slate-700">{req.date}</p>
                        </div>
                        
                        {req.status === 'Chờ duyệt' && (
                            <button className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors" title="Hủy yêu cầu">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        )}
                        {req.status === 'Đã duyệt' && (
                            <div className="text-xs font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg text-center">
                                Vui lòng đến Thư viện<br/>nhận sách trong 48h
                            </div>
                        )}
                        {req.status === 'Từ chối' && (
                            <button className="text-xs font-bold text-primary hover:underline px-4 py-2">Chi tiết lý do</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
}
