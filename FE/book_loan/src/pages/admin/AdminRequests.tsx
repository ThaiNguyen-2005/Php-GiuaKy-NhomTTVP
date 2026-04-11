import React, { startTransition, useEffect, useMemo, useState } from 'react';
import {
  approveBorrow,
  getAllRequests,
  returnBook,
  type BorrowRequest,
} from '../../api/borrowApi';
import { getErrorMessage, isUnauthorizedError } from '../../lib/errors';
import { emitToast } from '../../notifications/events';

type RequestTab = 'ALL' | 'BORROWED' | 'HISTORY';

const TAB_LABELS: Record<RequestTab, string> = {
  ALL: 'Yêu cầu chờ duyệt',
  BORROWED: 'Đang mượn',
  HISTORY: 'Lịch sử trả sách',
};

function getOptimisticStatusLabel(status: BorrowRequest['raw_status']) {
  if (status === 'borrowed') return 'Đang mượn';
  if (status === 'returned') return 'Đã trả';
  if (status === 'pending') return 'Chờ duyệt';
  return 'Từ chối';
}

function getTodayLabel() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminRequests() {
  const [tab, setTab] = useState<RequestTab>('ALL');
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);

  const fetchRequests = async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const data = await getAllRequests();
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    if (tab === 'ALL') {
      return requests.filter((request) => request.raw_status === 'pending');
    }

    if (tab === 'BORROWED') {
      return requests.filter((request) => request.raw_status === 'borrowed');
    }

    if (tab === 'HISTORY') {
      return requests.filter((request) => request.raw_status === 'returned');
    }

    return requests;
  }, [requests, tab]);

  const applyOptimisticUpdate = (
    loanId: number,
    nextStatus: BorrowRequest['raw_status'],
  ) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === loanId
          ? {
              ...request,
              raw_status: nextStatus,
              status: getOptimisticStatusLabel(nextStatus),
              date: getTodayLabel(),
            }
          : request,
      ),
    );
  };

  const handleApprove = async (loanId: number) => {
    setActiveRequestId(loanId);

    try {
      await approveBorrow(loanId);
      startTransition(() => applyOptimisticUpdate(loanId, 'borrowed'));
      void fetchRequests(false);
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        return;
      }

      const message = getErrorMessage(error, 'Lỗi khi duyệt');
      emitToast({ tone: 'error', title: 'Không thể duyệt yêu cầu', message });
    } finally {
      setActiveRequestId(null);
    }
  };

  const handleReturn = async (loanId: number) => {
    setActiveRequestId(loanId);

    try {
      await returnBook(loanId);
      startTransition(() => applyOptimisticUpdate(loanId, 'returned'));
      void fetchRequests(false);
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        return;
      }

      const message = getErrorMessage(error, 'Lỗi khi trả sách');
      emitToast({ tone: 'error', title: 'Không thể nhận trả sách', message });
    } finally {
      setActiveRequestId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Duyệt mượn trả</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Xử lý các yêu cầu mượn mới và theo dõi sách đang luân chuyển.
          </p>
        </div>
        <div className="rounded-full bg-surface-container px-4 py-2 text-xs font-semibold text-outline">
          {filteredRequests.length} mục trong tab {TAB_LABELS[tab].toLowerCase()}
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-surface-container-low bg-surface-bright scholar-shadow">
        <div className="flex border-b border-surface-container bg-slate-50/50">
          {(Object.keys(TAB_LABELS) as RequestTab[]).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`flex-1 py-4 text-sm font-bold transition-all ${
                tab === tabKey
                  ? 'border-b-2 border-primary bg-white text-primary'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {TAB_LABELS[tabKey]}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-surface-container bg-white text-xs font-bold uppercase tracking-widest text-slate-500">
                <th className="px-6 py-4">Mã phiếu</th>
                <th className="px-6 py-4">Thông tin độc giả</th>
                <th className="px-6 py-4">Tài liệu</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    Không có bản ghi phù hợp trong tab này.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => {
                  const isBusy = activeRequestId === request.id;

                  return (
                    <tr key={request.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className="rounded bg-slate-100 px-2 py-1 text-sm font-bold text-slate-700">
                          #{request.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${request.roleColor}`}
                          >
                            {request.role}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{request.name}</p>
                            <p className="text-[10px] text-slate-500">ID: {request.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-700">{request.book}</p>
                        <p className="text-[10px] text-slate-500">Mã kho: {request.bookCode}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-slate-600">
                          <span className="material-symbols-outlined text-[14px]">
                            calendar_today
                          </span>
                          <span className="text-xs font-medium">{request.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {request.raw_status === 'pending' ? (
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={isBusy}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-primary/30 transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                          >
                            {isBusy ? 'Đang xử lý...' : 'Giao sách'}
                          </button>
                        ) : request.raw_status === 'borrowed' ? (
                          <button
                            onClick={() => handleReturn(request.id)}
                            disabled={isBusy}
                            className="whitespace-nowrap rounded-lg bg-tertiary px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-tertiary/30 transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                          >
                            {isBusy ? 'Đang xử lý...' : 'Nhận trả sách'}
                          </button>
                        ) : (
                          <button className="px-3 py-1.5 text-xs font-semibold text-primary hover:underline">
                            Chi tiết
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
