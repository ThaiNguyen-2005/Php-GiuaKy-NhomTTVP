import React from 'react';

export default function AdminSettings() {
    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-on-surface">Cài đặt Hệ thống</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Cấu hình tham số thư viện, tài khoản quản trị và giao diện</p>
                </div>
                <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:-translate-y-0.5 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">save</span> Lưu thay đổi
                </button>
            </div>

            <div className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 bg-slate-50 border-r border-surface-container p-6 space-y-2 shrink-0">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-surface-container-high text-primary font-bold shadow-sm">
                        <span className="material-symbols-outlined text-[20px] filled">policy</span> Quy tắc mượn trả
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-200/50 font-medium transition-colors">
                        <span className="material-symbols-outlined text-[20px]">manage_accounts</span> Ngân sách & Phạt
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-200/50 font-medium transition-colors">
                        <span className="material-symbols-outlined text-[20px]">palette</span> Giao diện
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-200/50 font-medium transition-colors">
                        <span className="material-symbols-outlined text-[20px]">sync</span> Tích hợp APIs
                    </button>
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 p-8 space-y-10">
                    {/* Section 1 */}
                    <section>
                        <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px] filled">timelapse</span>
                            Thời lượng mượn sách
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Tối đa cho Sinh viên (Ngày)</label>
                                <input type="number" defaultValue={14} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Tối đa cho Giảng viên (Ngày)</label>
                                <input type="number" defaultValue={60} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Số lượng mượn tối đa (Cuốn)</label>
                                <input type="number" defaultValue={5} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Thời hạn gia hạn tối đa (Ngày)</label>
                                <input type="number" defaultValue={7} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                        </div>
                    </section>

                    <div className="w-full h-px bg-slate-200"></div>

                    {/* Section 2 */}
                    <section>
                        <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500 text-[20px] filled">gavel</span>
                            Mức phạt quá hạn
                        </h4>
                        
                        <div className="bg-red-50/50 border border-red-100 rounded-xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h5 className="font-bold text-slate-800 text-sm">Phạt tiền quá hạn theo ngày</h5>
                                    <p className="text-xs text-slate-500 mt-1">Hệ thống sẽ cộng dồn số tiền cho mỗi ngày nộp muộn</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="number" defaultValue={5000} className="w-32 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-primary/20 outline-none" />
                                    <span className="text-sm font-bold text-slate-600">VNĐ</span>
                                </div>
                            </div>
                            <div className="w-full h-px bg-red-100"></div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h5 className="font-bold text-slate-800 text-sm">Đình chỉ thẻ (Khóa tạm thời)</h5>
                                    <p className="text-xs text-slate-500 mt-1">Tự động khóa nếu giữ sách quá thời gian này</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="number" defaultValue={30} className="w-32 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-primary/20 outline-none" />
                                    <span className="text-sm font-bold text-slate-600">Ngày</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="w-full h-px bg-slate-200"></div>

                    {/* Section 3 */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500 text-[20px] filled">admin_panel_settings</span>
                                Tài khoản Quản trị
                            </h4>
                            <button className="text-xs font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-lg">Thêm thủ thư</button>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">NL</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Nguyễn Văn Lộc</p>
                                        <p className="text-[10px] text-slate-500">Super Admin • locnv@hcmue.edu.vn</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded bg-slate-100 text-slate-400 text-xs font-bold border border-slate-200">Không thể xóa</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl group hover:border-blue-300 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">MH</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Trần Minh Hải</p>
                                        <p className="text-[10px] text-slate-500">Thủ thư duyệt sách • haitm@hcmue.edu.vn</p>
                                    </div>
                                </div>
                                <button className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg">
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
