import React, { useState, useEffect } from 'react';
import { getMemberRequests } from '../../api/borrowApi';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending:  { label: 'Chờ duyệt', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    borrowed: { label: 'Đang mượn', color: 'text-green-600 bg-green-50 border-green-200' },
    returned: { label: 'Đã trả',    color: 'text-slate-500 bg-slate-100 border-slate-200' },
    rejected: { label: 'Từ chối',   color: 'text-red-600 bg-red-50 border-red-200' },
};

export default function StudentRequests() {
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'borrowed' | 'returned'>('all');
    const [allRequests, setAllRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) { setIsLoading(false); return; }
        const user = JSON.parse(userStr);
        if (!user.member_id) { setIsLoading(false); return; }

        getMemberRequests(user.member_id)
            .then(data => {
                const mapped = data.map((r: any) => {
                    const cfg = STATUS_MAP[r.status] || { label: r.status, color: 'text-slate-500 bg-slate-100 border-slate-200' };
                    return {
                        id: r.id,
                        book: r.bookTitle,
                        author: r.author,
                        cover: r.cover,
                        date: r.borrow_date ? new Date(r.borrow_date).toLocaleDateString('vi-VN') : '—',
                        returnDate: r.return_date ? new Date(r.return_date).toLocaleDateString('vi-VN') : null,
                        rawStatus: r.status,
                        statusLabel: cfg.label,
                        statusColor: cfg.color,
                    };
                });
                setAllRequests(mapped);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const countOf = (s: string) => allRequests.filter(r => r.rawStatus === s).length;
    const filtered = activeTab === 'all' ? allRequests : allRequests.filter(r => r.rawStatus === activeTab);

    const tabs = [
        { key: 'all',      label: `Tất cả (${allRequests.length})` },
        { key: 'pending',  label: `Chờ duyệt (${countOf('pending')})` },
        { key: 'borrowed', label: `Đang mượn (${countOf('borrowed')})` },
        { key: 'returned', label: `Đã trả (${countOf('returned')})` },
    ] as const;

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-on-surface">Yêu cầu mượn sách</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Theo dõi quá trình phê duyệt các đơn mượn sách của bạn</p>
                </div>
            </div>

            <div className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low overflow-hidden">
                {/* Filter Tabs */}
                <div className="p-4 border-b border-surface-container bg-slate-50 flex items-center gap-2 flex-wrap">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-all ${
                                activeTab === t.key
                                    ? 'bg-primary text-white shadow'
                                    : 'text-slate-500 hover:bg-slate-200'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="divide-y divide-surface-container">
                    {isLoading ? (
                        <div className="p-10 text-center text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-3">hourglass_empty</span>
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-3">inbox</span>
                            <p className="text-sm">Không có yêu cầu nào.</p>
                        </div>
                    ) : filtered.map(req => (
                        <div key={req.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center gap-4">
                            {/* Cover */}
                            <div className="w-12 h-16 rounded-lg overflow-hidden bg-surface-container shrink-0">
                                <img src={req.cover} alt={req.book} className="w-full h-full object-cover" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">#{req.id}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${req.statusColor}`}>
                                        {req.statusLabel}
                                    </span>
                                </div>
                                <h4 className="text-base font-bold text-on-surface truncate">{req.book}</h4>
                                <p className="text-xs text-on-surface-variant">{req.author}</p>
                            </div>

                            {/* Dates & Actions */}
                            <div className="flex gap-5 items-center justify-end shrink-0">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Ngày mượn</p>
                                    <p className="text-sm font-medium text-slate-700">{req.date}</p>
                                </div>
                                {req.returnDate && (
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Ngày trả</p>
                                        <p className="text-sm font-medium text-green-700">{req.returnDate}</p>
                                    </div>
                                )}
                                {req.rawStatus === 'pending' && (
                                    <button className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors" title="Hủy yêu cầu">
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                )}
                                {req.rawStatus === 'borrowed' && (
                                    <div className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg text-center leading-snug whitespace-nowrap">
                                        Đến Thư viện<br />nhận sách
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
