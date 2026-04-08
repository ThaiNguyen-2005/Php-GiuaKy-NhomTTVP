import React, { useEffect, useState } from 'react';
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
                status: 'Hoạt động',
                statusColor: 'bg-green-100 text-green-700 border-green-200',
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
                    <h2 className="text-3xl font-bold text-on-surface">Quản lý thành viên</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Quản lý hồ sơ độc giả, phân quyền và khóa thẻ</p>
                </div>
            </div>

            <section className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-white border-b border-surface-container text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <th className="px-6 py-4">Mã độc giả</th>
                                <th className="px-6 py-4">Họ và tên</th>
                                <th className="px-6 py-4">Khoa / Đơn vị</th>
                                <th className="px-6 py-4">Loại thẻ</th>
                                <th className="px-6 py-4">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Đang tải danh sách...</td>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
