import React, { useState } from 'react';

const mockRequests = [
    { id: 101, name: 'Nguyễn Văn An', role: 'SV', roleColor: 'bg-primary-container text-primary', code: '2056010001', book: 'Lịch sử Triết học Tây phương', bookCode: 'PHIL-102', status: 'Chờ duyệt', date: '20/10/2023 08:30' },
    { id: 102, name: 'TS. Trần Thị Bình', role: 'GV', roleColor: 'bg-surface-container-highest text-on-surface-variant', code: '105202', book: 'Giáo dục học Đại học', bookCode: 'EDU-501', status: 'Đang mượn', date: '15/10/2023 10:15' },
    { id: 103, name: 'Lê Hoàng Nam', role: 'SV', roleColor: 'bg-primary-container text-primary', code: '2056010145', book: 'Cấu trúc dữ liệu và Giải thuật', bookCode: 'IT-009', status: 'Quá hạn', date: '01/10/2023 16:45' },
    { id: 104, name: 'Trần Minh Đức', role: 'SV', roleColor: 'bg-primary-container text-primary', code: '2156030221', book: 'Kinh tế Vĩ mô', bookCode: 'ECO-201', status: 'Chờ duyệt', date: '21/10/2023 09:00' },
];

export default function AdminRequests() {
    const [tab, setTab] = useState('ALL');

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-on-surface">Duyệt mượn trả</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Xử lý các yêu cầu mượn mới và theo dõi sách chậm trả</p>
                </div>
            </div>

            {/* Quick Actions (Barcode entry) */}
            <section className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex flex-col md:flex-row gap-6 md:items-end">
                <div className="flex-1 w-full relative">
                    <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2 font-label">Nghiệp vụ nhanh (Quét mã vạch)</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/60">barcode_scanner</span>
                        <input 
                            type="text" 
                            placeholder="Quét mã vạch thẻ sinh viên hoặc mã sách..." 
                            className="w-full pl-12 pr-4 py-3 bg-white border border-primary/20 rounded-xl focus:ring-2 focus:ring-primary/50 text-slate-800 outline-none"
                            autoFocus
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white border border-surface-container-high text-slate-700 rounded-xl font-bold flex flex-col items-center justify-center hover:bg-slate-50 transition-all shadow-sm">
                         Trả sách
                    </button>
                    <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex flex-col items-center justify-center hover:bg-blue-700 transition-all shadow-md shadow-primary/20">
                         Mượn sách
                    </button>
                </div>
            </section>

            <section className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-surface-container bg-slate-50/50">
                    <button 
                        onClick={() => setTab('ALL')}
                        className={`flex-1 py-4 text-sm font-bold transition-all ${tab === 'ALL' ? 'text-primary border-b-2 border-primary bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                    >
                        Yêu cầu chờ duyệt
                    </button>
                    <button 
                        onClick={() => setTab('BORROWED')}
                        className={`flex-1 py-4 text-sm font-bold transition-all ${tab === 'BORROWED' ? 'text-primary border-b-2 border-primary bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                    >
                        Đang mượn / Quá hạn
                    </button>
                    <button 
                        onClick={() => setTab('HISTORY')}
                        className={`flex-1 py-4 text-sm font-bold transition-all ${tab === 'HISTORY' ? 'text-primary border-b-2 border-primary bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                    >
                        Lịch sử trả sách
                    </button>
                </div>

                <div className="p-4 border-b border-surface-container flex items-center justify-between">
                     <p className="text-xs font-medium text-slate-500">Hiển thị yêu cầu dựa trên tùy chọn bộ lọc.</p>
                     <button className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:underline">
                         <span className="material-symbols-outlined text-[16px]">filter_alt</span> Nâng cao
                     </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-white border-b border-surface-container text-xs font-bold uppercase tracking-widest text-slate-500">
                                <th className="px-6 py-4">Mã Phiếu</th>
                                <th className="px-6 py-4">Thông tin độc giả</th>
                                <th className="px-6 py-4">Tài liệu tham khảo</th>
                                <th className="px-6 py-4">Thời gian</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container">
                            {mockRequests.map(req => (
                                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">#{req.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${req.roleColor}`}>{req.role}</div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{req.name}</p>
                                                <p className="text-[10px] text-slate-500">ID: {req.code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-700">{req.book}</p>
                                        <p className="text-[10px] text-slate-500">Mã kho: {req.bookCode}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-slate-600">
                                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                            <span className="text-xs font-medium">{req.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {req.status === 'Chờ duyệt' && <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 border border-blue-200 rounded-md">Chờ xử lý</span>}
                                        {req.status === 'Đang mượn' && <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 border border-green-200 rounded-md">Đang mượn</span>}
                                        {req.status === 'Quá hạn' && <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 border border-red-200 rounded-md">Quá hạn</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {req.status === 'Chờ duyệt' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white shadow-sm shadow-primary/30 hover:opacity-90 transition-opacity">Giao sách</button>
                                                <button className="p-1.5 rounded-lg text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all" title="Từ chối">
                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                </button>
                                            </div>
                                        ) : req.status === 'Quá hạn' ? (
                                            <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-tertiary text-white shadow-sm shadow-tertiary/30 hover:opacity-90 transition-opacity whitespace-nowrap">Đòi sách & Phạt</button>
                                        ) : (
                                            <button className="px-3 py-1.5 text-xs font-semibold text-primary hover:underline">Chi tiết</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
