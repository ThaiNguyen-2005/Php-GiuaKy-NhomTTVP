import React, { useEffect, useState } from 'react';
import { fetchBooks } from '../../api/bookApi';
import { getAllRequests } from '../../api/borrowApi';
import { getAllMembers } from '../../api/userApi';

export default function AdminReports() {
    const [stats, setStats] = useState({
        borrows: 0,
        members: 0,
        overdueRate: 0,
        digitalDownloads: 0,
    });
    const [bars, setBars] = useState<{ label: string; value: number }[]>([]);
    const [topBooks, setTopBooks] = useState<{ name: string; author: string; borrowCount: number; percentage: number }[]>([]);

    useEffect(() => {
        Promise.all([fetchBooks(), getAllRequests(), getAllMembers()]).then(([books, requests, members]) => {
            const borrowed = requests.filter((request) => request.raw_status === 'borrowed');
            const overdue = borrowed.filter((request) => {
                if (!request.due_date) {
                    return false;
                }

                return new Date(request.due_date) < new Date();
            });

            const requestCounts = books.map((book) => ({
                name: book.title,
                author: book.author,
                borrowCount: requests.filter((request) => Number(request.bookCode) === book.id).length,
            })).sort((a, b) => b.borrowCount - a.borrowCount);

            const maxBorrowCount = requestCounts[0]?.borrowCount || 1;

            setStats({
                borrows: requests.length,
                members: members.length,
                overdueRate: borrowed.length ? Math.round((overdue.length / borrowed.length) * 100) : 0,
                digitalDownloads: books.length,
            });

            setBars([
                { label: 'Chờ duyệt', value: requests.filter((request) => request.raw_status === 'pending').length },
                { label: 'Đang mượn', value: borrowed.length },
                { label: 'Đã trả', value: requests.filter((request) => request.raw_status === 'returned').length },
            ]);

            setTopBooks(
                requestCounts.slice(0, 4).map((book) => ({
                    ...book,
                    percentage: Math.max(10, Math.round((book.borrowCount / maxBorrowCount) * 100)),
                }))
            );
        }).catch(console.error);
    }, []);

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-on-surface">Báo cáo thống kê</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Phân tích dữ liệu sử dụng thư viện và số liệu mượn trả.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface-bright p-6 rounded-2xl scholar-shadow border border-surface-container-low">
                    <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Lượt mượn / trả</p>
                    <h3 className="text-3xl font-bold text-on-surface">{stats.borrows}</h3>
                </div>
                <div className="bg-surface-bright p-6 rounded-2xl scholar-shadow border border-surface-container-low">
                    <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Thành viên</p>
                    <h3 className="text-3xl font-bold text-on-surface">{stats.members}</h3>
                </div>
                <div className="bg-surface-bright p-6 rounded-2xl scholar-shadow border border-surface-container-low">
                    <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Tỷ lệ quá hạn</p>
                    <h3 className="text-3xl font-bold text-on-surface">{stats.overdueRate}%</h3>
                </div>
                <div className="bg-surface-bright p-6 rounded-2xl scholar-shadow border border-surface-container-low">
                    <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Tài liệu đang hiển thị</p>
                    <h3 className="text-3xl font-bold text-on-surface">{stats.digitalDownloads}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low p-6 h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-on-surface mb-6">Phân bố trạng thái phiếu mượn</h3>
                    <div className="flex-1 border-b border-l border-surface-container relative flex items-end justify-between px-4 pb-2 gap-6">
                        {bars.map((bar) => (
                            <div key={bar.label} className="flex-1 flex flex-col items-center justify-end gap-3">
                                <div className="w-full bg-primary/20 rounded-t border-t-2 border-primary transition-all" style={{ height: `${Math.max(bar.value * 20, 30)}px` }}></div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">{bar.label}</p>
                                    <p className="text-xs text-slate-400">{bar.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-on-surface mb-6">Top sách được mượn</h3>
                    <div className="space-y-4">
                        {topBooks.map((book, idx) => (
                            <div key={book.name} className="flex items-center gap-4">
                                <div className="w-8 font-bold text-slate-300 text-lg">0{idx + 1}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{book.name}</p>
                                        <p className="text-xs font-medium text-slate-500">{book.borrowCount} lượt</p>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="h-full rounded-full bg-primary" style={{ width: `${book.percentage}%` }}></div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">{book.author}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
