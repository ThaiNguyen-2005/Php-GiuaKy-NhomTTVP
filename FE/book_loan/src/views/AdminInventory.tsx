import React, { useState } from 'react';

const mockInventory = [
    { id: 1, title: 'Giáo trình Tâm lý học Đại cương', author: 'Nhiều tác giả', isbn: '978-604-972', category: 'Giáo trình', location: 'Khu A - Kệ 12 - Tầng 2', status: 'Sẵn có (45/50)', statusColor: 'bg-green-500', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=100' },
    { id: 2, title: 'Lập trình Python cơ bản', author: 'TS. Nguyễn Mạnh Hùng', isbn: '978-123-456', category: 'Công nghệ thông tin', location: 'Khu B - Kệ 05 - Tầng 4', status: 'Hết sách (0/15)', statusColor: 'bg-tertiary', cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=100' },
    { id: 3, title: 'Tạp chí Giáo dục số 452', author: 'Bộ Giáo dục và Đào tạo', isbn: '2345-6789', category: 'Tạp chí', location: 'Khu T - Kệ 01 - Tầng 1', status: 'Sắp hết (2/10)', statusColor: 'bg-orange-400', cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=100' },
    { id: 4, title: 'Nhập môn Trí tuệ Nhân tạo', author: 'Stuart Russell', isbn: '978-223-111', category: 'Công nghệ thông tin', location: 'Khu B - Kệ 08 - Tầng 4', status: 'Sẵn có (10/12)', statusColor: 'bg-green-500', cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=100' },
    { id: 5, title: 'Vật lý Đại cương', author: 'Alonso Finn', isbn: '978-999-888', category: 'Giáo trình', location: 'Khu A - Kệ 03 - Tầng 2', status: 'Sẵn có (100/120)', statusColor: 'bg-green-500', cover: 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?auto=format&fit=crop&q=80&w=100' },
];

export default function AdminInventory() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-on-surface">Quản lý kho sách</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Danh mục, số lượng và tình trạng sách trong thư viện HCMUE</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-surface-container text-on-surface rounded-xl font-medium hover:bg-surface-container-high transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">print</span> In mã vạch
                    </button>
                    <button className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:-translate-y-0.5 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">add</span> Thêm đầu sách
                    </button>
                </div>
            </div>

            <section className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low overflow-hidden">
                {/* Tools Bar */}
                <div className="p-6 border-b border-surface-container flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
                    <div className="flex-1 w-full md:max-w-md relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input 
                            type="text" 
                            placeholder="Tìm theo tên sách, tác giả, ISBN..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar pb-2 md:pb-0">
                        <button className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold whitespace-nowrap">Tất cả</button>
                        <button className="px-4 py-2 bg-white border border-surface-container-high text-on-surface-variant rounded-lg text-xs font-medium hover:bg-slate-50 whitespace-nowrap">Giáo trình</button>
                        <button className="px-4 py-2 bg-white border border-surface-container-high text-on-surface-variant rounded-lg text-xs font-medium hover:bg-slate-50 whitespace-nowrap">Tạp chí</button>
                        <button className="px-4 py-2 bg-white border border-surface-container-high text-on-surface-variant rounded-lg text-xs font-medium hover:bg-slate-50 whitespace-nowrap">KHTN & CN</button>
                        <button className="px-4 py-2 bg-white border border-surface-container-high text-on-surface-variant rounded-lg text-xs font-medium hover:bg-slate-50 flex items-center gap-1 whitespace-nowrap">
                            <span className="material-symbols-outlined text-sm">filter_list</span> Lọc
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-surface-container">
                                <th className="px-6 py-4">Bìa sách</th>
                                <th className="px-6 py-4">Thông tin sách</th>
                                <th className="px-6 py-4">Phân loại</th>
                                <th className="px-6 py-4">Vị trí kho</th>
                                <th className="px-6 py-4">Trình trạng</th>
                                <th className="px-6 py-4 text-right">Quản lý</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container">
                            {mockInventory.map(book => (
                                <tr key={book.id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="w-12 h-16 rounded-lg bg-surface-container-high overflow-hidden border border-surface-container shadow-sm">
                                            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-xs">
                                            <p className="text-sm font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">{book.title}</p>
                                            <p className="text-xs text-outline mt-0.5">Tác giả: {book.author}</p>
                                            <p className="text-[10px] font-mono text-primary mt-1 bg-primary/5 px-2 py-0.5 rounded inline-block">ISBN: {book.isbn}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-md bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase border border-surface-container">{book.category}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-700">{book.location}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${book.statusColor}`}></div>
                                            <span className="text-xs font-bold text-slate-700">{book.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-80 hover:opacity-100 transition-opacity">
                                            <button className="p-2 rounded-lg text-primary hover:bg-primary-container transition-all" title="Chỉnh sửa">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button className="p-2 rounded-lg text-tertiary hover:bg-tertiary-container transition-all" title="Báo mất">
                                                <span className="material-symbols-outlined text-[18px]">report</span>
                                            </button>
                                            <button className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all" title="Xóa">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-surface-container flex items-center justify-between bg-white">
                    <p className="text-xs text-outline font-medium">Hiển thị 1 - 5 trong tổng số 1,204 sách</p>
                    <div className="flex gap-1">
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-surface-container hover:bg-surface-container transition-all">
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white font-bold text-xs">1</button>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-surface-container hover:bg-surface-container transition-all text-xs font-medium">2</button>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-surface-container hover:bg-surface-container transition-all text-xs font-medium">3</button>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-surface-container hover:bg-surface-container transition-all">
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
