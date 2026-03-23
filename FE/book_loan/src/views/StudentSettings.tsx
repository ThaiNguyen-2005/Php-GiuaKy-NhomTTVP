import React from 'react';

export default function StudentSettings() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Cài đặt Cá nhân</h2>
          <p className="text-on-surface-variant text-sm mt-1">Quản lý hồ sơ độc giả và tùy chọn nhận thông báo của bạn</p>
        </div>
        <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:-translate-y-0.5 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">save</span> Lưu thay đổi
        </button>
      </div>

      <div className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low overflow-hidden divide-y divide-surface-container">
        
        {/* Profile Section */}
        <section className="p-8">
            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-[20px] filled">account_circle</span>
                Thông tin Hồ sơ
            </h4>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-surface-container-high border-4 border-white shadow-md flex items-center justify-center text-4xl font-bold text-primary">
                        SV
                    </div>
                    <button className="text-xs font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-lg">Đổi ảnh đại diện</button>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Họ và tên</label>
                        <input type="text" defaultValue="Nguyễn Văn Sinh Viên" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none text-slate-500 cursor-not-allowed" readOnly />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Mã số sinh viên</label>
                        <input type="text" defaultValue="2056000001" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none text-slate-500 cursor-not-allowed" readOnly />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Email liên hệ</label>
                        <input type="email" defaultValue="2056000001@student.hcmue.edu.vn" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Số điện thoại</label>
                        <input type="text" defaultValue="09xx.xxx.xxx" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                </div>
            </div>
        </section>

        {/* Security Section */}
        <section className="p-8">
            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-orange-500 text-[20px] filled">lock</span>
                Bảo mật Tài khoản
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Mật khẩu hiện tại</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div></div>
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Mật khẩu mới</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Xác nhận mật khẩu mới</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
            </div>
        </section>

        {/* Preferences Section */}
        <section className="p-8">
            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-purple-500 text-[20px] filled">notifications</span>
                Tùy chọn Thông báo
            </h4>
            <div className="space-y-4 max-w-2xl">
                <div className="flex items-start gap-4">
                    <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 rounded border-outline text-primary focus:ring-primary" id="notif1" />
                    <label htmlFor="notif1" className="cursor-pointer">
                        <p className="font-bold text-sm text-slate-800">Cảnh báo sách sắp đến hạn trả</p>
                        <p className="text-xs text-slate-500 mt-0.5">Hệ thống sẽ gửi email nhắc nhở trước 2 ngày so với hạn trả sách</p>
                    </label>
                </div>
                <div className="flex items-start gap-4">
                    <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 rounded border-outline text-primary focus:ring-primary" id="notif2" />
                    <label htmlFor="notif2" className="cursor-pointer">
                        <p className="font-bold text-sm text-slate-800">Thông báo có sách tài liệu mới theo Ngành/Khoa</p>
                        <p className="text-xs text-slate-500 mt-0.5">Nhận bản tin hàng tháng về các đầu sách tiêu biểu mới nhập kho</p>
                    </label>
                </div>
                <div className="flex items-start gap-4">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-outline text-primary focus:ring-primary" id="notif3" />
                    <label htmlFor="notif3" className="cursor-pointer">
                        <p className="font-bold text-sm text-slate-800">Tin nhắn SMS cập nhật tình trạng phê duyệt đơn</p>
                        <p className="text-xs text-slate-500 mt-0.5">Nhận tin nhắn văn bản khi Thư viện duyệt hoặc từ chối đơn mượn sách của bạn</p>
                    </label>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
}
