import React, { useState, useEffect } from 'react';
import { getAllMembers } from '../../api/userApi';

export default function AdminMembers() {
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getAllMembers().then(data => {
            const mapped = data.map((m: any) => ({
                id: m.member_id,
                name: m.name,
                dept: 'Trường Đại học Sư phạm TP.HCM',
                type: 'Sinh viên',
                email: m.email || `${m.member_id}@student.hcmue.edu.vn`,
                status: 'Active',
                statusColor: 'bg-green-100 text-green-700 border-green-200',
                penaltyCnt: 0
            }));
            setMembers(mapped);
            setIsLoading(false);
        }).catch(e => {
            console.error(e);
            setIsLoading(false);
        });
    }, []);

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
                        <select aria-label="Loc theo loai the" className="w-full py-2.5 px-4 bg-white border border-surface-container-high rounded-xl text-sm text-slate-700 outline-none">
                            <option>Tất cả loại thẻ</option>
                            <option>Sinh viên</option>
                            <option>Giảng viên / Cán bộ</option>
                        </select>
                    </div>
                    <div>
                        <select aria-label="Loc theo trang thai" className="w-full py-2.5 px-4 bg-white border border-surface-container-high rounded-xl text-sm text-slate-700 outline-none">
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Đang tải danh sách...</td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Không có độc giả nào.</td>
                                </tr>
                            ) : members.map(member => (
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
                                        <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Chỉnh sửa thông vịn">
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
