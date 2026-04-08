import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'admin-library-settings';

const defaultSettings = {
  studentDays: 14,
  lecturerDays: 60,
  maxBooks: 5,
  renewalDays: 7,
  finePerDay: 5000,
  suspendAfterDays: 30,
};

export default function AdminSettings() {
    const [settings, setSettings] = useState(defaultSettings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return;
        }

        try {
            setSettings({ ...defaultSettings, ...JSON.parse(stored) });
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setIsSaving(true);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setTimeout(() => {
            setIsSaving(false);
            alert('Đã lưu cấu hình hệ thống trên trình duyệt hiện tại.');
        }, 250);
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-w-5xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-on-surface">Cài đặt hệ thống</h2>
                    <p className="text-on-surface-variant text-sm mt-1">Cấu hình tham số thư viện và quy tắc vận hành.</p>
                </div>
                <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:-translate-y-0.5 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">save</span> {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>

            <div className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low overflow-hidden p-8 space-y-10">
                <section>
                    <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px] filled">timelapse</span>
                        Thời lượng mượn sách
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="space-y-2">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Tối đa cho sinh viên (ngày)</span>
                            <input type="number" value={settings.studentDays} onChange={(e) => setSettings({ ...settings, studentDays: Number(e.target.value) })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                        </label>
                        <label className="space-y-2">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Tối đa cho giảng viên (ngày)</span>
                            <input type="number" value={settings.lecturerDays} onChange={(e) => setSettings({ ...settings, lecturerDays: Number(e.target.value) })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                        </label>
                        <label className="space-y-2">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Số lượng mượn tối đa (cuốn)</span>
                            <input type="number" value={settings.maxBooks} onChange={(e) => setSettings({ ...settings, maxBooks: Number(e.target.value) })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                        </label>
                        <label className="space-y-2">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Thời hạn gia hạn tối đa (ngày)</span>
                            <input type="number" value={settings.renewalDays} onChange={(e) => setSettings({ ...settings, renewalDays: Number(e.target.value) })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                        </label>
                    </div>
                </section>

                <section>
                    <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500 text-[20px] filled">gavel</span>
                        Mức phạt quá hạn
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="space-y-2">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Phạt theo ngày (VND)</span>
                            <input type="number" value={settings.finePerDay} onChange={(e) => setSettings({ ...settings, finePerDay: Number(e.target.value) })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                        </label>
                        <label className="space-y-2">
                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Tự động khóa thẻ sau (ngày)</span>
                            <input type="number" value={settings.suspendAfterDays} onChange={(e) => setSettings({ ...settings, suspendAfterDays: Number(e.target.value) })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                        </label>
                    </div>
                </section>
            </div>
        </form>
    );
}
