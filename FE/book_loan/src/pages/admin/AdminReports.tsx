import React, { useEffect, useState } from 'react';
import { fetchBooks, fetchDigitalDocuments } from '../../api/bookApi';
import { getAllRequests } from '../../api/borrowApi';
import { getAllMembers } from '../../api/userApi';
import { getErrorMessage } from '../../lib/errors';

type ReportStats = {
  borrows: number;
  members: number;
  overdueRate: number;
  digitalDownloads: number;
};

type ReportBar = {
  label: string;
  value: number;
};

type TopBook = {
  name: string;
  author: string;
  borrowCount: number;
  percentage: number;
};

const INITIAL_STATS: ReportStats = {
  borrows: 0,
  members: 0,
  overdueRate: 0,
  digitalDownloads: 0,
};

function getBarHeightClass(value: number) {
  if (value >= 6) return 'h-44';
  if (value >= 5) return 'h-40';
  if (value >= 4) return 'h-36';
  if (value >= 3) return 'h-32';
  if (value >= 2) return 'h-28';
  if (value >= 1) return 'h-24';
  return 'h-20';
}

function getWidthClass(percentage: number) {
  if (percentage >= 90) return 'w-[90%]';
  if (percentage >= 75) return 'w-3/4';
  if (percentage >= 60) return 'w-3/5';
  if (percentage >= 50) return 'w-1/2';
  if (percentage >= 40) return 'w-2/5';
  if (percentage >= 25) return 'w-1/4';
  return 'w-1/5';
}

export default function AdminReports() {
  const [stats, setStats] = useState<ReportStats>(INITIAL_STATS);
  const [bars, setBars] = useState<ReportBar[]>([]);
  const [topBooks, setTopBooks] = useState<TopBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadReports = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [books, requests, members, digitalDocuments] = await Promise.all([
          fetchBooks(),
          getAllRequests(),
          getAllMembers(),
          fetchDigitalDocuments(),
        ]);

        const borrowed = requests.filter((request) => request.raw_status === 'borrowed');
        const overdue = borrowed.filter((request) => {
          if (!request.due_date) {
            return false;
          }

          return new Date(request.due_date) < new Date();
        });

        const requestCounts = books
          .map((book) => ({
            name: book.title,
            author: book.author,
            borrowCount: requests.filter(
              (request) => Number(request.bookCode) === book.id,
            ).length,
          }))
          .sort((a, b) => b.borrowCount - a.borrowCount);

        const maxBorrowCount = requestCounts[0]?.borrowCount || 1;

        if (!isActive) {
          return;
        }

        setStats({
          borrows: requests.length,
          members: members.length,
          overdueRate: borrowed.length ? Math.round((overdue.length / borrowed.length) * 100) : 0,
          digitalDownloads: digitalDocuments.length,
        });

        setBars([
          { label: 'Chờ duyệt', value: requests.filter((request) => request.raw_status === 'pending').length },
          { label: 'Đang mượn', value: borrowed.length },
          { label: 'Đã trả', value: requests.filter((request) => request.raw_status === 'returned').length },
        ]);

        setTopBooks(
          requestCounts.slice(0, 4).map((book) => ({
            ...book,
            percentage: Math.max(10, Math.round((book.borrowCount / maxBorrowCount) * 100)),
          })),
        );
      } catch (loadError: unknown) {
        if (!isActive) {
          return;
        }

        setError(getErrorMessage(loadError, 'Không thể tải báo cáo thống kê.'));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadReports();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Báo cáo thống kê</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Phân tích dữ liệu sử dụng thư viện và số liệu mượn trả.
          </p>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
        >
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-surface-container-low bg-surface-bright p-6 scholar-shadow">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-outline">Lượt mượn / trả</p>
          <h3 className="text-3xl font-bold text-on-surface">
            {isLoading ? '—' : stats.borrows}
          </h3>
        </div>
        <div className="rounded-2xl border border-surface-container-low bg-surface-bright p-6 scholar-shadow">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-outline">Thành viên</p>
          <h3 className="text-3xl font-bold text-on-surface">
            {isLoading ? '—' : stats.members}
          </h3>
        </div>
        <div className="rounded-2xl border border-surface-container-low bg-surface-bright p-6 scholar-shadow">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-outline">Tỷ lệ quá hạn</p>
          <h3 className="text-3xl font-bold text-on-surface">
            {isLoading ? '—' : `${stats.overdueRate}%`}
          </h3>
        </div>
        <div className="rounded-2xl border border-surface-container-low bg-surface-bright p-6 scholar-shadow">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-outline">
            Tài liệu số
          </p>
          <h3 className="text-3xl font-bold text-on-surface">
            {isLoading ? '—' : stats.digitalDownloads}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="flex h-[400px] flex-col rounded-2xl border border-surface-container-low bg-surface-bright p-6 scholar-shadow">
          <h3 className="mb-6 text-lg font-bold text-on-surface">Phân bố trạng thái phiếu mượn</h3>
          <div className="flex flex-1 items-end justify-between gap-6 rounded-xl border-b border-l border-surface-container px-4 pb-2">
            {isLoading ? (
              <div className="flex h-full w-full items-center justify-center text-sm text-on-surface-variant">
                Đang tải dữ liệu...
              </div>
            ) : (
              bars.map((bar) => (
                <div key={bar.label} className="flex flex-1 flex-col items-center justify-end gap-3">
                  <div
                    className={`w-full rounded-t border-t-2 border-primary bg-primary/20 transition-all ${getBarHeightClass(
                      bar.value,
                    )}`}
                  />
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-500">{bar.label}</p>
                    <p className="text-xs text-slate-400">{bar.value}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="flex flex-col rounded-2xl border border-surface-container-low bg-surface-bright p-6 scholar-shadow">
          <h3 className="mb-6 text-lg font-bold text-on-surface">Top sách được mượn</h3>
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center text-sm text-on-surface-variant">
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="space-y-4">
              {topBooks.map((book, index) => (
                <div key={book.name} className="flex items-center gap-4">
                  <div className="w-8 text-lg font-bold text-slate-300">0{index + 1}</div>
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between gap-4">
                      <p className="max-w-[200px] truncate text-sm font-bold text-slate-700">
                        {book.name}
                      </p>
                      <p className="text-xs font-medium text-slate-500">{book.borrowCount} lượt</p>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full bg-primary ${getWidthClass(book.percentage)}`} />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">{book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
