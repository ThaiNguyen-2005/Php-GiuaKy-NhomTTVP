import React from 'react';

export default function AdminReports() {
    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-on-surface">Báo cáo Thống kê</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Phân tích dữ liệu sử dụng Thư viện và số liệu mượn trả</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-surface-container text-on-surface rounded-xl font-medium hover:bg-surface-container-high transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">calendar_month</span> Tháng này
                        <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                    </button>
                    <button className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:-translate-y-0.5 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">download</span> Xuất dữ liệu
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface-bright p-6 rounded-2xl scholar-shadow border border-surface-container-low flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <span className="material-symbols-outlined text-[20px]">library_books</span>
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">+12%</span>
                    </div>
                    <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Lượt mượn sách mới</p>
                    <h3 className="text-3xl font-bold text-on-surface">1,492</h3>
                </div>
                
                <div className="bg-surface-bright p-6 rounded-2xl scholar-shadow border border-surface-container-low flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">+5%</span>
                    </div>
                    <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Độc giả truy cập</p>
                    <h3 className="text-3xl font-bold text-on-surface">3,205</h3>
                </div>

                <div className="bg-surface-bright p-6 rounded-2xl scholar-shadow border border-surface-container-low flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <span className="material-symbols-outlined text-[20px]">assignment_late</span>
                        </div>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full flex items-center gap-1">+2%</span>
                    </div>
                    <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Tỷ lệ quá hạn</p>
                    <h3 className="text-3xl font-bold text-on-surface">4.5%</h3>
                </div>

                <div className="bg-surface-bright p-6 rounded-2xl scholar-shadow border border-surface-container-low flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                            <span className="material-symbols-outlined text-[20px]">payments</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full flex items-center gap-1">0%</span>
                    </div>
                    <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Quỹ tiền phạt</p>
                    <h3 className="text-3xl font-bold text-on-surface">1.2tr đ</h3>
                </div>
            </div>

            {/* Charts Area (Simulated) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low p-6 h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-on-surface mb-6">Lưu lượng Mượn trả 30 ngày qua</h3>
                    <div className="flex-1 border-b border-l border-surface-container relative flex items-end justify-between px-4 pb-2 text-[10px] font-medium text-slate-400">
                        {/* Mock bars */}
                        <div className="w-[10%] bg-primary/20 rounded-t border-t-2 border-primary h-[40%] relative group cursor-pointer hover:bg-primary/40 transition-colors"></div>
                        <div className="w-[10%] bg-primary/20 rounded-t border-t-2 border-primary h-[60%] relative group cursor-pointer hover:bg-primary/40 transition-colors"></div>
                        <div className="w-[10%] bg-primary/20 rounded-t border-t-2 border-primary h-[50%] relative group cursor-pointer hover:bg-primary/40 transition-colors"></div>
                        <div className="w-[10%] bg-primary/20 rounded-t border-t-2 border-primary h-[80%] relative group cursor-pointer hover:bg-primary/40 transition-colors"></div>
                        <div className="w-[10%] bg-primary/20 rounded-t border-t-2 border-primary h-[30%] relative group cursor-pointer hover:bg-primary/40 transition-colors"></div>
                        <div className="w-[10%] bg-primary/20 rounded-t border-t-2 border-primary h-[90%] relative group cursor-pointer hover:bg-primary/40 transition-colors"></div>
                        <div className="w-[10%] bg-primary/20 rounded-t border-t-2 border-primary h-[70%] relative group cursor-pointer hover:bg-primary/40 transition-colors"></div>
                    </div>
                    <div className="flex justify-between px-4 mt-2 text-[10px] font-bold text-slate-500 uppercase">
                        <span>Tuần 1</span><span>Tuần 2</span><span>Tuần 3</span><span>Tuần 4</span>
                    </div>
                </section>

                <section className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-on-surface mb-6">Top Sách Được Trưng Dụng</h3>
                    
                    <div className="space-y-4">
                        {[
                            { name: 'Khéo ăn nói sẽ có được thiên hạ', author: 'Trác Nhã', borrowCount: 145, percentage: 80, color: 'bg-green-500' },
                            { name: 'Toán cao cấp A1', author: 'Nguyễn Đình Trí', borrowCount: 120, percentage: 65, color: 'bg-primary' },
                            { name: 'Nhà Giả Kim', author: 'Paulo Coelho', borrowCount: 95, percentage: 50, color: 'bg-orange-500' },
                            { name: 'Sapiens: Lược sử loài người', author: 'Yuval Noah Harari', borrowCount: 88, percentage: 45, color: 'bg-purple-500' }
                        ].map((book, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className="w-8 font-bold text-slate-300 text-lg">0{idx + 1}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{book.name}</p>
                                        <p className="text-xs font-medium text-slate-500">{book.borrowCount} lượt</p>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                        <div className={`h-full rounded-full ${book.color}`} style={{ width: `${book.percentage}%` }}></div>
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
