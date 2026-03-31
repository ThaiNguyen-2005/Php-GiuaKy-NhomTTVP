import React, { useState, useEffect } from 'react';
import { getMemberRequests } from '../../api/borrowApi';

export default function History() {
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) { setIsLoading(false); return; }
        const user = JSON.parse(userStr);
        if (!user.member_id) { setIsLoading(false); return; }

        getMemberRequests(user.member_id)
            .then(data => {
                // Only show returned books in history
                const returned = data.filter((r: any) => r.status === 'returned');
                setHistory(returned.map((r: any, i: number) => ({
                    id: `H-${r.id}`,
                    book: r.bookTitle,
                    author: r.author,
                    borrowDate: r.borrow_date ? new Date(r.borrow_date).toLocaleDateString('vi-VN') : '—',
                    returnDate: r.return_date ? new Date(r.return_date).toLocaleDateString('vi-VN') : '—',
                    status: 'Đúng hạn',
                    color: 'text-green-600 bg-green-50',
                })));
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

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
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Đang tải lịch sử...</td></tr>
                        ) : history.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12">
                                    <div className="flex flex-col items-center justify-center text-center opacity-50">
                                        <span className="material-symbols-outlined text-5xl mb-3">history</span>
                                        <p className="font-bold text-lg">Chưa có lịch sử</p>
                                        <p className="text-sm">Bạn chưa từng trả cuốn sách nào.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : history.map(item => (
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
            </div>
        </div>
    );
}
