import React, { useEffect, useState } from 'react';
import { getMyRequests } from '../../api/borrowApi';
import EmptyState from '../../components/EmptyState';
import { applyImageFallback, formatDisplayDate, getCoverUrl } from '../../lib/display';
import { getErrorMessage } from '../../lib/errors';
import { emitToast } from '../../notifications/events';
import type { MemberBorrowRequest } from '../../types/request';

const STATUS_MAP: Record<
  MemberBorrowRequest['status'],
  { label: string; color: string }
> = {
  pending: { label: 'Chờ duyệt', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  borrowed: { label: 'Đang mượn', color: 'text-green-600 bg-green-50 border-green-200' },
  returned: { label: 'Đã trả', color: 'text-slate-500 bg-slate-100 border-slate-200' },
  rejected: { label: 'Từ chối', color: 'text-red-600 bg-red-50 border-red-200' },
};

type RequestRow = {
  id: number;
  book: string;
  author: string;
  cover?: string | null;
  date: string;
  dateLabel: string;
  rawStatus: MemberBorrowRequest['status'];
  statusLabel: string;
  statusColor: string;
  rejectionReason?: string | null;
};

export default function StudentRequests() {
  const [activeTab, setActiveTab] = useState<'all' | MemberBorrowRequest['status']>('all');
  const [allRequests, setAllRequests] = useState<RequestRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    getMyRequests()
      .then((data: MemberBorrowRequest[]) => {
        const mapped = data.map((r) => {
          const cfg = STATUS_MAP[r.status] || {
            label: r.status,
            color: 'text-slate-500 bg-slate-100 border-slate-200',
          };

          return {
            id: r.id,
            book: r.bookTitle,
            author: r.author,
            cover: getCoverUrl(r.cover),
            date: formatDisplayDate(r.status === 'rejected' ? r.rejected_at || r.borrow_date : r.borrow_date),
            dateLabel: r.status === 'rejected' ? 'Ngày từ chối' : 'Ngày mượn',
            rawStatus: r.status,
            statusLabel: cfg.label,
            statusColor: cfg.color,
            rejectionReason: r.rejection_reason || null,
          };
        });
        setAllRequests(mapped);
      })
      .catch((error: unknown) => {
        const message = getErrorMessage(error, 'Không thể tải yêu cầu mượn sách.');
        setError(message);
        emitToast({ tone: 'error', title: 'Không thể tải yêu cầu', message });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const countOf = (status: MemberBorrowRequest['status']) =>
    allRequests.filter((r) => r.rawStatus === status).length;
  const filtered =
    activeTab === 'all' ? allRequests : allRequests.filter((r) => r.rawStatus === activeTab);

  const tabs = [
    { key: 'all', label: `Tất cả (${allRequests.length})` },
    { key: 'pending', label: `Chờ duyệt (${countOf('pending')})` },
    { key: 'borrowed', label: `Đang mượn (${countOf('borrowed')})` },
    { key: 'returned', label: `Đã trả (${countOf('returned')})` },
    { key: 'rejected', label: `Từ chối (${countOf('rejected')})` },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Yêu cầu mượn sách</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Theo dõi quá trình phê duyệt các đơn mượn sách của bạn
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-surface-container-low bg-surface-bright scholar-shadow">
        <div className="flex flex-wrap items-center gap-2 border-b border-surface-container bg-slate-50 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow'
                  : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="divide-y divide-surface-container">
          {isLoading ? (
            <div className="p-10 text-center text-slate-400">
              <span className="material-symbols-outlined mb-3 text-4xl">hourglass_empty</span>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="p-5">
              <EmptyState icon="error" title="Không thể tải dữ liệu" message={error} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon="pending_actions"
                title="Không có yêu cầu phù hợp"
                message="Các yêu cầu mượn, phiếu đang mượn và lịch sử xử lý sẽ xuất hiện tại đây."
              />
            </div>
          ) : (
            filtered.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-4 p-5 transition-colors hover:bg-slate-50/50 md:flex-row md:items-center"
              >
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                  <img
                    src={request.cover}
                    alt={request.book}
                    onError={(event) => applyImageFallback(event.currentTarget)}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-400">
                      #{request.id}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${request.statusColor}`}
                    >
                      {request.statusLabel}
                    </span>
                  </div>
                  <h4 className="truncate text-base font-bold text-on-surface">{request.book}</h4>
                  <p className="text-xs text-on-surface-variant">{request.author}</p>
                  {request.rawStatus === 'rejected' && request.rejectionReason ? (
                    <p className="mt-1 text-xs text-red-600">
                      Lý do: {request.rejectionReason}
                    </p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-outline">
                    {request.dateLabel}
                  </p>
                  <p className="text-sm font-medium text-slate-700">{request.date}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
