import React from 'react';

const mockMembers = [
    { id: '2056010001', name: 'Nguyễn Văn An', dept: 'CNTT', type: 'Sinh viên', email: '2056010001@student.hcmue.edu.vn', status: 'Active', statusColor: 'bg-green-100 text-green-700 border-green-200', penaltyCnt: 0 },
    { id: '105202', name: 'Trần Thị Bình', dept: 'Toán học', type: 'Giảng viên', email: 'binhtt@hcmue.edu.vn', status: 'Active', statusColor: 'bg-green-100 text-green-700 border-green-200', penaltyCnt: 0 },
    { id: '2056010145', name: 'Lê Hoàng Nam', dept: 'Hóa học', type: 'Sinh viên', email: '2056010145@student.hcmue.edu.vn', status: 'Blocked', statusColor: 'bg-red-100 text-red-700 border-red-200', penaltyCnt: 2 },
    { id: '2156030221', name: 'Trần Minh Đức', dept: 'Ngữ văn', type: 'Sinh viên', email: '2156030221@student.hcmue.edu.vn', status: 'Warning', statusColor: 'bg-orange-100 text-orange-700 border-orange-200', penaltyCnt: 1 },
];

export default function AdminMembers() {
    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-on-surface">Quản lý Thành viên</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Quản lý hồ sơ độc giả, phân quyền và khóa thẻ</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-surface-container text-on-surface rounded-xl font-medium hover:bg-surface-container-high transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">upload_file</span> Nhập Excel
                    </button>
                    <button className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:-translate-y-0.5 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">person_add</span> Thêm độc giả
                    </button>
                </div>
            </div>

            <section className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low overflow-hidden">
                <div className="p-6 border-b border-surface-container grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/30">
                    <div className="md:col-span-2 relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input type="text" placeholder="Tra cứu theo MSSV, Email, Họ tên..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div>
                        <select className="w-full py-2.5 px-4 bg-white border border-surface-container-high rounded-xl text-sm text-slate-700 outline-none">
                            <option>Tất cả loại thẻ</option>
                            <option>Sinh viên</option>
                            <option>Giảng viên / Cán bộ</option>
                        </select>
                    </div>
                    <div>
                        <select className="w-full py-2.5 px-4 bg-white border border-surface-container-high rounded-xl text-sm text-slate-700 outline-none">
                            <option>Mọi trạng thái</option>
                            <option>Đang kích hoạt</option>
                            <option>Bị cảnh cáo</option>
                            <option>Đang khóa</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-white border-b border-surface-container text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <th className="px-6 py-4">Mã Độc Giả</th>
                                <th className="px-6 py-4">Họ và tên</th>
                                <th className="px-6 py-4">Khoa / Đơn vị</th>
                                <th className="px-6 py-4">Loại thẻ</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-center">Vi phạm</th>
                                <th className="px-6 py-4 text-right">Tùy chọn</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container">
                            {mockMembers.map(member => (
                                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-mono font-bold text-slate-700">{member.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{member.name}</p>
                                                <p className="text-[10px] text-slate-500">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{member.dept}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 text-slate-600">{member.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border rounded-md ${member.statusColor}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {member.penaltyCnt > 0 ? (
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold font-mono">
                                                {member.penaltyCnt}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Chỉnh sửa thông tin">
                                            <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-tertiary hover:bg-tertiary/10 rounded-lg transition-colors" title="Khóa thẻ">
                                            <span className="material-symbols-outlined text-[18px]">credit_card_off</span>
                                        </button>
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
