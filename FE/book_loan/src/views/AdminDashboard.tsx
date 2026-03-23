import React from 'react';

const pendingRequests = [
    { id: 1, name: 'Nguyễn Văn An', role: 'SV', roleColor: 'bg-primary-container text-primary', code: '2056010001', book: 'Lịch sử Triết học Tây phương', bookCode: 'PHIL-102', date: '20/10/2023 08:30' },
    { id: 2, name: 'TS. Trần Thị Bình', role: 'GV', roleColor: 'bg-surface-container-highest text-on-surface-variant', code: '105202', book: 'Giáo dục học Đại học', bookCode: 'EDU-501', date: '20/10/2023 10:15' },
    { id: 3, name: 'Lê Hoàng Nam', role: 'SV', roleColor: 'bg-primary-container text-primary', code: '2056010145', book: 'Cấu trúc dữ liệu và Giải thuật', bookCode: 'IT-009', date: '19/10/2023 16:45' },
];

const inventoryBooks = [
    { id: 1, title: 'Giáo trình Tâm lý học Đại cương', author: 'Nhiều tác giả', isbn: '978-604-972', category: 'Giáo trình', location: 'Khu A - Kệ 12 - Tầng 2', status: 'Sẵn có (45/50)', statusColor: 'bg-green-500', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=100' },
    { id: 2, title: 'Lập trình Python cơ bản', author: 'TS. Nguyễn Mạnh Hùng', isbn: '978-123-456', category: 'Công nghệ thông tin', location: 'Khu B - Kệ 05 - Tầng 4', status: 'Hết sách (0/15)', statusColor: 'bg-tertiary', cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=100' },
    { id: 3, title: 'Tạp chí Giáo dục số 452', author: 'Bộ Giáo dục và Đào tạo', isbn: '2345-6789', category: 'Tạp chí', location: 'Khu T - Kệ 01 - Tầng 1', status: 'Sắp hết (2/10)', statusColor: 'bg-orange-400', cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=100' },
];

export default function AdminDashboard() {
    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface-bright p-6 rounded-xl scholar-shadow border border-surface-container-low">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined">pending_actions</span>
                    </div>
                    <p className="text-outline text-xs font-bold uppercase tracking-wider">Yêu cầu mới</p>
                    <h3 className="text-3xl font-bold mt-1">24</h3>
                </div>
                <div className="bg-surface-bright p-6 rounded-xl scholar-shadow border border-surface-container-low">
                    <div className="w-12 h-12 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined">event_busy</span>
                    </div>
                    <p className="text-outline text-xs font-bold uppercase tracking-wider">Quá hạn</p>
                    <h3 className="text-3xl font-bold mt-1">12</h3>
                </div>
                <div className="bg-surface-bright p-6 rounded-xl scholar-shadow border border-surface-container-low">
                    <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined">inventory</span>
                    </div>
                    <p className="text-outline text-xs font-bold uppercase tracking-wider">Tổng đầu sách</p>
                    <h3 className="text-3xl font-bold mt-1">1,204</h3>
                </div>
                <div className="bg-surface-bright p-6 rounded-xl scholar-shadow border border-surface-container-low">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined">person_search</span>
                    </div>
                    <p className="text-outline text-xs font-bold uppercase tracking-wider">Thành viên mới</p>
                    <h3 className="text-3xl font-bold mt-1">8</h3>
                </div>
            </div>

            {/* Main Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Action Form */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-surface-bright p-8 rounded-xl scholar-shadow border border-surface-container-low relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary filled">bolt</span>
                            Xử lý nhanh
                        </h3>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-outline mb-1 uppercase tracking-wider">Mã Thành viên (Member ID)</label>
                                <input type="text" placeholder="Ví dụ: LIB-2023-001" className="w-full bg-surface-container border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-outline mb-1 uppercase tracking-wider">Mã Sách (Book ID)</label>
                                <input type="text" placeholder="Ví dụ: ISBN-978013" className="w-full bg-surface-container border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                            </div>
                            <div className="pt-2 grid grid-cols-2 gap-3">
                                <button type="button" className="bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                                    <span className="material-symbols-outlined text-sm">output</span> Cho mượn
                                </button>
                                <button type="button" className="bg-primary-container text-primary py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-200 transition-all">
                                    <span className="material-symbols-outlined text-sm">input</span> Trả sách
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="bg-surface-bright p-6 rounded-xl scholar-shadow border border-surface-container-low">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-outline">Ghi chú vận hành</h3>
                            <button className="text-primary text-xs font-medium">Xem tất cả</button>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-surface-container rounded-lg text-xs">
                                <p className="font-semibold text-on-surface">Kiểm kê định kỳ khu B</p>
                                <p className="text-on-surface-variant mt-1">Dự kiến hoàn thành vào 17:00 ngày 25/10.</p>
                            </div>
                            <div className="p-3 bg-tertiary-container/30 border-l-4 border-tertiary rounded-lg text-xs">
                                <p className="font-semibold text-tertiary">Sách hỏng cần phục chế</p>
                                <p className="text-tertiary/80 mt-1">3 quyển sách giáo trình Tâm lý học (ID: PSY-02) bị rách trang.</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Approval Table */}
                <div className="lg:col-span-2">
                    <section className="bg-surface-bright rounded-xl scholar-shadow border border-surface-container-low overflow-hidden h-full flex flex-col">
                        <div className="p-6 border-b border-surface-container flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-on-surface">Duyệt mượn mới</h3>
                                <p className="text-xs text-outline mt-1">Danh sách các yêu cầu đang chờ xử lý từ sinh viên</p>
                            </div>
                            <button className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                                <span className="material-symbols-outlined text-base">filter_list</span> Lọc
                            </button>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low border-b border-surface-container text-xs font-bold uppercase tracking-widest text-outline">
                                        <th className="px-6 py-4">Thành viên</th>
                                        <th className="px-6 py-4">Sách yêu cầu</th>
                                        <th className="px-6 py-4">Ngày yêu cầu</th>
                                        <th className="px-6 py-4 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-container">
                                    {pendingRequests.map(req => (
                                        <tr key={req.id} className="hover:bg-surface-container/50 transition-all group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${req.roleColor}`}>{req.role}</div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-on-surface">{req.name}</p>
                                                        <p className="text-[10px] text-outline">MSSV: {req.code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-on-surface">{req.book}</p>
                                                <p className="text-[10px] text-outline">Mã: {req.bookCode}</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-on-surface-variant">{req.date}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:opacity-90">Duyệt</button>
                                                    <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
                                                        <span className="material-symbols-outlined text-lg">close</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-surface-container-low flex items-center justify-center border-t border-surface-container mt-auto">
                            <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">Xem tất cả yêu cầu</button>
                        </div>
                    </section>
                </div>
            </div>

            {/* Inventory Management Section */}
            <section className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low overflow-hidden">
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-container">
                    <div>
                        <h3 className="text-2xl font-bold text-on-surface">Quản lý kho sách</h3>
                        <p className="text-on-surface-variant text-sm mt-1">Quản lý danh mục, tình trạng và số lượng sách hiện có</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-6 py-3 bg-primary text-white rounded-xl font-semibold flex items-center gap-2 scholar-shadow hover:-translate-y-0.5 transition-all">
                            <span className="material-symbols-outlined">add</span> Thêm sách mới
                        </button>
                        <button className="p-3 bg-surface-container text-on-surface-variant rounded-xl hover:bg-surface-container-high transition-all">
                            <span className="material-symbols-outlined">file_download</span>
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-2">
                            <button className="px-4 py-2 rounded-full bg-primary text-white text-xs font-medium">Tất cả</button>
                            <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium hover:bg-surface-container-high">Sách giấy</button>
                            <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium hover:bg-surface-container-high">E-Book</button>
                            <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium hover:bg-surface-container-high">Tài liệu tham khảo</button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-outline">Sắp xếp:</span>
                            <select className="text-xs font-medium border-none bg-transparent focus:ring-0 cursor-pointer outline-none">
                                <option>Mới nhất</option>
                                <option>Tên A-Z</option>
                                <option>Số lượng</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-surface-container">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                    <th className="px-6 py-4">Bìa sách</th>
                                    <th className="px-6 py-4">Thông tin sách</th>
                                    <th className="px-6 py-4">Phân loại</th>
                                    <th className="px-6 py-4">Vị trí kho</th>
                                    <th className="px-6 py-4">Trình trạng</th>
                                    <th className="px-6 py-4 text-right">Quản lý</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-container">
                                {inventoryBooks.map(book => (
                                    <tr key={book.id} className="hover:bg-surface-container/30 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-16 rounded-lg bg-surface-container-high overflow-hidden border border-surface-container">
                                                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                <p className="text-sm font-bold text-on-surface line-clamp-1">{book.title}</p>
                                                <p className="text-xs text-outline mt-0.5">Tác giả: {book.author}</p>
                                                <p className="text-[10px] font-mono text-primary mt-1">ISBN: {book.isbn}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase">{book.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium">{book.location}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${book.statusColor}`}></div>
                                                <span className="text-xs font-medium">{book.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button className="p-2 rounded-lg text-primary hover:bg-primary-container transition-all">
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-all">
                                                    <span className="material-symbols-outlined text-lg">history</span>
                                                </button>
                                                <button className="p-2 rounded-lg text-tertiary hover:bg-tertiary-container transition-all">
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <p className="text-xs text-outline">Hiển thị 1 - 10 trong tổng số 1,204 sách</p>
                        <div className="flex gap-1">
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-surface-container hover:bg-surface-container transition-all">
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white font-bold text-xs">1</button>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-surface-container hover:bg-surface-container transition-all text-xs">2</button>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-surface-container hover:bg-surface-container transition-all text-xs">3</button>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-surface-container hover:bg-surface-container transition-all">
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Return Confirmation Table */}
            <section className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low overflow-hidden">
                <div className="p-6 border-b border-surface-container flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary">published_with_changes</span>
                    <h3 className="text-lg font-bold text-on-surface">Xác nhận trả sách gần đây</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-surface-container">
                            <tr className="group">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-4">
                                        <span className="material-symbols-outlined text-green-500 bg-green-50 p-2 rounded-full">check_circle</span>
                                        <div>
                                            <p className="text-sm font-semibold">Lê Văn Khoa đã trả "Vật lý Đại cương"</p>
                                            <p className="text-[10px] text-outline mt-0.5">Hoàn tất lúc: 14:20 - Không có hư hỏng</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <button className="px-4 py-2 bg-surface-container text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container-high transition-all">
                                        Chi tiết
                                    </button>
                                </td>
                            </tr>
                            <tr className="group">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-4">
                                        <span className="material-symbols-outlined text-tertiary bg-tertiary-container/30 p-2 rounded-full">report</span>
                                        <div>
                                            <p className="text-sm font-semibold">Phạm Minh Tuấn đã trả "Kinh tế học"</p>
                                            <p className="text-[10px] text-tertiary mt-0.5">Phát hiện: Rách bìa - Cần thu phí phạt</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <button className="px-4 py-2 bg-tertiary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all">
                                        Xử lý phạt
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <footer className="mt-auto border-t border-surface-container py-6 flex flex-col md:flex-row items-center justify-between text-[10px] font-bold text-outline uppercase tracking-widest">
                <p>© 2023 HCMUE DIGITAL LIBRARY SYSTEM - LIBRARIAN PANEL V2.4</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-primary transition-colors">Hướng dẫn sử dụng</a>
                    <a href="#" className="hover:text-primary transition-colors">Báo cáo sự cố</a>
                    <a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a>
                </div>
            </footer>
        </div>
    );
}
