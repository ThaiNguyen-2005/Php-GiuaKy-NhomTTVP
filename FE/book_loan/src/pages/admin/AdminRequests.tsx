import React, { startTransition, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  approveBorrow,
  getAllRequests,
  rejectBorrow,
  returnBook,
  type BorrowRequest,
} from '../../api/borrowApi';
import EmptyState from '../../components/EmptyState';
import { getErrorMessage, isUnauthorizedError } from '../../lib/errors';
import { emitToast } from '../../notifications/events';

type RequestTab = 'ALL' | 'BORROWED' | 'HISTORY' | 'REJECTED';

const TAB_LABELS: Record<RequestTab, string> = {
  ALL: 'Yêu cầu chờ duyệt',
  BORROWED: 'Đang mượn',
  HISTORY: 'Lịch sử trả sách',
  REJECTED: 'Yêu cầu từ chối',
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<RequestTab>('ALL');
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<BorrowRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [detailTarget, setDetailTarget] = useState<BorrowRequest | null>(null);
  const bookFilter = searchParams.get('book');

  const fetchRequests = async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      setLoadError(null);
      const data = await getAllRequests();
      setRequests(data);
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        return;
      }

      const message = getErrorMessage(error, 'Không thể tải danh sách yêu cầu.');
      setLoadError(message);
      emitToast({ tone: 'error', title: 'Không thể tải yêu cầu', message });
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
    const scopedRequests =
      tab === 'ALL'
        ? requests.filter((request) => request.raw_status === 'pending')
        : tab === 'BORROWED'
          ? requests.filter((request) => request.raw_status === 'borrowed')
          : tab === 'HISTORY'
            ? requests.filter((request) => request.raw_status === 'returned')
            : tab === 'REJECTED'
              ? requests.filter((request) => request.raw_status === 'rejected')
              : requests;

    if (!bookFilter) {
      return scopedRequests;
    }

    return scopedRequests.filter((request) => request.bookCode === bookFilter);
  }, [bookFilter, requests, tab]);

  const applyOptimisticUpdate = (
    loanId: number,
    nextStatus: BorrowRequest['raw_status'],
    patch: Partial<BorrowRequest> = {},
  ) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === loanId
          ? {
              ...request,
              raw_status: nextStatus,
              status: getOptimisticStatusLabel(nextStatus),
              date: getTodayLabel(),
              ...patch,
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

  const openRejectDialog = (request: BorrowRequest) => {
    setRejectTarget(request);
    setRejectReason('');
    setRejectError(null);
  };

  const closeRejectDialog = () => {
    setRejectTarget(null);
    setRejectReason('');
    setRejectError(null);
  };

  const handleRejectSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!rejectTarget) {
      return;
    }

    const reason = rejectReason.trim();

    if (reason.length < 3) {
      setRejectError('Vui lòng nhập lý do từ chối từ 3 ký tự trở lên.');
      return;
    }

    setActiveRequestId(rejectTarget.id);

    try {
      await rejectBorrow(rejectTarget.id, reason);
      startTransition(() => {
        applyOptimisticUpdate(rejectTarget.id, 'rejected', {
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
        });
        setTab('REJECTED');
      });
      closeRejectDialog();
      void fetchRequests(false);
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        return;
      }

      const message = getErrorMessage(error, 'Lỗi khi từ chối yêu cầu');
      emitToast({ tone: 'error', title: 'Không thể từ chối yêu cầu', message });
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
        <div className="flex flex-wrap items-center gap-2">
          {bookFilter ? (
            <button
              type="button"
              onClick={() => {
                const nextParams = new URLSearchParams(searchParams);
                nextParams.delete('book');
                setSearchParams(nextParams, { replace: true });
              }}
              className="rounded-full bg-primary-container px-4 py-2 text-xs font-semibold text-primary hover:bg-primary-container/80"
            >
              Mã sách {bookFilter} ×
            </button>
          ) : null}
          <div className="rounded-full bg-surface-container px-4 py-2 text-xs font-semibold text-outline">
            {filteredRequests.length} mục trong tab {TAB_LABELS[tab].toLowerCase()}
          </div>
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
              ) : loadError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8">
                    <EmptyState icon="error" title="Không thể tải yêu cầu" message={loadError} />
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8">
                    <EmptyState
                      icon="assignment"
                      title="Không có bản ghi phù hợp"
                      message="Các phiếu mượn sẽ xuất hiện khi sinh viên gửi yêu cầu hoặc thủ thư xử lý phiếu."
                    />
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
                        {request.raw_status === 'rejected' && request.rejection_reason ? (
                          <p className="mt-1 max-w-xs text-xs text-red-600">
                            Lý do: {request.rejection_reason}
                          </p>
                        ) : null}
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
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={isBusy}
                              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-primary/30 transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                            >
                              {isBusy ? 'Đang xử lý...' : 'Giao sách'}
                            </button>
                            <button
                              onClick={() => openRejectDialog(request)}
                              disabled={isBusy}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : request.raw_status === 'borrowed' ? (
                          <button
                            onClick={() => handleReturn(request.id)}
                            disabled={isBusy}
                            className="whitespace-nowrap rounded-lg bg-tertiary px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-tertiary/30 transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                          >
                            {isBusy ? 'Đang xử lý...' : 'Nhận trả sách'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDetailTarget(request)}
                            className="px-3 py-1.5 text-xs font-semibold text-primary hover:underline"
                          >
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

      {rejectTarget ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-request-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        >
          <form
            onSubmit={handleRejectSubmit}
            className="w-full max-w-md rounded-lg border border-surface-container bg-white p-6 shadow-xl"
          >
            <h3 id="reject-request-title" className="text-lg font-bold text-slate-900">
              Từ chối yêu cầu #{rejectTarget.id}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Nhập lý do để sinh viên có thể xem lại trong lịch sử yêu cầu.
            </p>

            <label className="mt-5 block space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Lý do từ chối
              </span>
              <textarea
                value={rejectReason}
                onChange={(event) => {
                  setRejectReason(event.target.value);
                  setRejectError(null);
                }}
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Ví dụ: Sách đang được kiểm kê hoặc thông tin yêu cầu chưa hợp lệ."
              />
            </label>

            {rejectError ? (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {rejectError}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeRejectDialog}
                disabled={activeRequestId === rejectTarget.id}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={activeRequestId === rejectTarget.id}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
              >
                {activeRequestId === rejectTarget.id ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {detailTarget ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-detail-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        >
          <div className="w-full max-w-lg rounded-lg border border-surface-container bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="request-detail-title" className="text-lg font-bold text-slate-900">
                  Chi tiết phiếu #{detailTarget.id}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {detailTarget.status} | Cập nhật: {detailTarget.date || 'N/A'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailTarget(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Độc giả
                </dt>
                <dd className="mt-1 font-semibold text-slate-800">
                  {detailTarget.name} ({detailTarget.code})
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Tài liệu
                </dt>
                <dd className="mt-1 font-semibold text-slate-800">
                  {detailTarget.book} ({detailTarget.bookCode})
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Ngày yêu cầu
                </dt>
                <dd className="mt-1 text-slate-700">{detailTarget.requested_at || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Hạn trả
                </dt>
                <dd className="mt-1 text-slate-700">{detailTarget.due_date || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Ngày trả
                </dt>
                <dd className="mt-1 text-slate-700">{detailTarget.return_date || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Ngày từ chối
                </dt>
                <dd className="mt-1 text-slate-700">{detailTarget.rejected_at || 'N/A'}</dd>
              </div>
            </dl>

            {detailTarget.rejection_reason ? (
              <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                <span className="font-bold">Lý do từ chối: </span>
                {detailTarget.rejection_reason}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
