import React, { useEffect, useState } from 'react';
import { emitToast } from '../../notifications/events';

const STORAGE_KEY = 'admin-library-settings';

const defaultSettings = {
  studentDays: 14,
  lecturerDays: 60,
  maxBooks: 5,
  renewalDays: 7,
  finePerDay: 5000,
  suspendAfterDays: 30,
};

type Settings = typeof defaultSettings;

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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

    window.setTimeout(() => {
      setIsSaving(false);
      const message = 'Đã lưu cấu hình hệ thống trên trình duyệt hiện tại.';
      setFeedback(message);
      emitToast({ tone: 'success', title: 'Đã lưu cấu hình', message });
    }, 250);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-5xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Cài đặt hệ thống</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Cấu hình tham số thư viện và quy tắc vận hành.
          </p>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-medium text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined text-sm">save</span>
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          {feedback}
        </div>
      ) : null}

      <div className="space-y-10 overflow-hidden rounded-2xl border border-surface-container-low bg-surface-bright p-8 scholar-shadow">
        <section>
          <h4 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
            <span className="material-symbols-outlined filled text-[20px] text-primary">
              timelapse
            </span>
            Thời lượng mượn sách
          </h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                Tối đa cho sinh viên (ngày)
              </span>
              <input
                type="number"
                value={settings.studentDays}
                onChange={(e) =>
                  setSettings({ ...settings, studentDays: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                Tối đa cho giảng viên (ngày)
              </span>
              <input
                type="number"
                value={settings.lecturerDays}
                onChange={(e) =>
                  setSettings({ ...settings, lecturerDays: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                Số lượng mượn tối đa (cuốn)
              </span>
              <input
                type="number"
                value={settings.maxBooks}
                onChange={(e) => setSettings({ ...settings, maxBooks: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                Thời hạn gia hạn tối đa (ngày)
              </span>
              <input
                type="number"
                value={settings.renewalDays}
                onChange={(e) =>
                  setSettings({ ...settings, renewalDays: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
        </section>

        <section>
          <h4 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
            <span className="material-symbols-outlined filled text-[20px] text-red-500">
              gavel
            </span>
            Mức phạt quá hạn
          </h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                Phạt theo ngày (VND)
              </span>
              <input
                type="number"
                value={settings.finePerDay}
                onChange={(e) =>
                  setSettings({ ...settings, finePerDay: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                Tự động khóa thẻ sau (ngày)
              </span>
              <input
                type="number"
                value={settings.suspendAfterDays}
                onChange={(e) =>
                  setSettings({ ...settings, suspendAfterDays: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
        </section>
      </div>
    </form>
  );
}
