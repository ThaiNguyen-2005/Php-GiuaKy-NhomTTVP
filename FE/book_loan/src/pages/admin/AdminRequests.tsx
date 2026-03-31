import React, { useState, useEffect } from 'react';
import { getAllRequests, approveBorrow, returnBook } from '../../api/borrowApi';

export default function AdminRequests() {
    const [tab, setTab] = useState('ALL');
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const data = await getAllRequests();
            setRequests(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const getLibrarianId = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.librarian_id;
        }
        return null;
    };

    const handleApprove = async (loanId: number) => {
        const libId = getLibrarianId();
        if (!libId) {
            alert('Lỗi xác thực thủ thư');
            return;
        }
        try {
            await approveBorrow(loanId, libId);
            fetchRequests(); // Refresh data
        } catch (e: any) {
            alert(e.message || 'Lỗi khi duyệt');
        }
    };

    const handleReturn = async (loanId: number) => {
        const libId = getLibrarianId();
        if (!libId) {
            alert('Lỗi xác thực thủ thư');
            return;
        }
        try {
            await returnBook(loanId, libId);
            fetchRequests(); // Refresh data
        } catch (e: any) {
            alert(e.message || 'Lỗi khi trả sách');
        }
    };

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
                        Đang mượn
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                                </tr>
                            ) : requests.filter(r => {
                                if (tab === 'ALL') return r.status === 'Chờ duyệt';
                                if (tab === 'BORROWED') return r.status === 'Đang mượn';
                                if (tab === 'HISTORY') return r.status === 'Đã trả';
                                return true;
                            }).length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Không có dữ liệu</td>
                                </tr>
                            ) : requests.filter(r => {
                                if (tab === 'ALL') return r.status === 'Chờ duyệt';
                                if (tab === 'BORROWED') return r.status === 'Đang mượn';
                                if (tab === 'HISTORY') return r.status === 'Đã trả';
                                return true;
                            }).map(req => (
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
                                        {req.status === 'Đã trả' && <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 rounded-md">Đã trả</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {req.status === 'Chờ duyệt' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleApprove(req.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white shadow-sm shadow-primary/30 hover:opacity-90 transition-opacity">Giao sách</button>
                                                <button className="p-1.5 rounded-lg text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all" title="Từ chối">
                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                </button>
                                            </div>
                                        ) : req.status === 'Đang mượn' ? (
                                            <button onClick={() => handleReturn(req.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-tertiary text-white shadow-sm shadow-tertiary/30 hover:opacity-90 transition-opacity whitespace-nowrap">Nhận trả sách</button>
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
