import React, { useEffect, useState } from 'react';
import { getAllMembers } from '../../api/userApi';
import type { MemberApiRecord, MemberListItem } from '../../types/member';

const SCHOOL_LABEL = 'Trường Đại học Sư phạm TP.HCM';

function mapMember(member: MemberApiRecord): MemberListItem {
  return {
    id: member.member_id,
    name: member.name,
    dept: SCHOOL_LABEL,
    type: 'Sinh viên',
    email: member.email || `${member.member_id}@student.hcmue.edu.vn`,
    status: 'Hoạt động',
    statusColor: 'bg-green-100 text-green-700 border-green-200',
  };
}

export default function AdminMembers() {
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllMembers()
      .then((data) => {
        setMembers(data.map(mapMember));
      })
      .catch((error: unknown) => {
        console.error(error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Quản lý thành viên</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Quản lý hồ sơ độc giả, phân quyền và khóa thẻ
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-surface-container-low bg-surface-bright scholar-shadow">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead>
              <tr className="border-b border-surface-container bg-white text-[10px] font-bold uppercase tracking-widest text-slate-500">
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
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-bold text-slate-700">
                        {member.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold uppercase text-slate-600">
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
                      <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {member.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${member.statusColor}`}
                      >
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
