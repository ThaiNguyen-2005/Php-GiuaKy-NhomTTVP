import React, { useState, useEffect } from 'react';
import { fetchBooks, addBook, updateBook, deleteBook } from '../../api/bookApi';
import { FormattedBook } from '../../types/book';

export default function AdminInventory() {
    const [searchTerm, setSearchTerm] = useState('');
    const [books, setBooks] = useState<FormattedBook[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [formData, setFormData] = useState({
        id: 0, title: '', author: '', isbn: '', category: 'Giáo trình', location: '', cover: '', is_available: true, quantity: 1
    });

    const loadBooks = async () => {
        setLoading(true);
        try {
            const data = await fetchBooks();
            setBooks(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBooks();
    }, []);

    const openAddModal = () => {
        setModalMode('add');
        setFormData({ id: 0, title: '', author: '', isbn: '', category: 'Giáo trình', location: '', cover: '', is_available: true, quantity: 1 });
        setIsModalOpen(true);
    };

    const openEditModal = (book: any) => {
        setModalMode('edit');
        setFormData({ ...book, is_available: book.status !== 'Hết sách', quantity: book.quantity || 1 });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Bạn có chắc chắn muốn xóa sách này?')) {
            try {
                await deleteBook(id);
                loadBooks();
            } catch (e: any) {
                alert(e.message || 'Lỗi khi xóa');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await addBook(formData);
            } else {
                await updateBook(formData.id, formData);
            }
            setIsModalOpen(false);
            loadBooks();
        } catch (err: any) {
            alert(err.message || 'Lỗi khi lưu sách');
        }
    };



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
                    <button onClick={openAddModal} className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:-translate-y-0.5 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
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
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-outline text-sm">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : books.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-outline text-sm">
                                        Không tìm thấy sách.
                                    </td>
                                </tr>
                            ) : (
                                books.map(book => (
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
                                            <button onClick={() => openEditModal(book)} className="p-2 rounded-lg text-primary hover:bg-primary-container transition-all" title="Chỉnh sửa">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button className="p-2 rounded-lg text-tertiary hover:bg-tertiary-container transition-all" title="Báo mất">
                                                <span className="material-symbols-outlined text-[18px]">report</span>
                                            </button>
                                            <button onClick={() => handleDelete(book.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all" title="Xóa">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )))}
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

            {/* Modal Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
                        <div className="p-6 border-b border-surface-container flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">{modalMode === 'add' ? 'Thêm đầu sách mới' : 'Chỉnh sửa thông tin sách'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Tên sách <span className="text-red-500">*</span></label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Tác giả <span className="text-red-500">*</span></label>
                                    <input required type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">ISBN</label>
                                    <input type="text" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Phân loại <span className="text-red-500">*</span></label>
                                    <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Vị trí (Kệ)</label>
                                    <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Số lượng <span className="text-red-500">*</span></label>
                                    <input required type="number" min="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">URL Ảnh bìa</label>
                                    <input type="text" value={formData.cover} onChange={e => setFormData({...formData, cover: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="https://..." />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3 justify-end mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Hủy</button>
                                <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-opacity">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
