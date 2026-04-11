import React, { useEffect, useMemo, useState } from 'react';
import { fetchBooks } from '../../api/bookApi';
import {
  approveBorrow,
  getAllRequests,
  returnBook,
  type BorrowRequest,
} from '../../api/borrowApi';
import { getAllMembers } from '../../api/userApi';
import { getErrorMessage, isUnauthorizedError } from '../../lib/errors';
import { emitToast } from '../../notifications/events';
import type { FormattedBook } from '../../types/book';

type DashboardInventoryBook = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  location: string;
  status: string;
  statusColor: string;
  cover: string;
};

type DashboardStats = {
  requests: number;
  overdue: number;
  books: number;
  members: number;
};

type QuickActionForm = {
  memberId: string;
  bookId: string;
};

type QuickActionFeedback = {
  tone: 'success' | 'error' | 'neutral';
  message: string;
};

const INITIAL_STATS: DashboardStats = {
  requests: 0,
  overdue: 0,
  books: 0,
  members: 0,
};

function normalizeIdentifier(value: string | number | null | undefined) {
  return String(value ?? '').trim();
}

function isMatchingIdentifier(input: string, candidate: string | number | null | undefined) {
  const normalizedInput = normalizeIdentifier(input);
  const normalizedCandidate = normalizeIdentifier(candidate);

  if (!normalizedInput || !normalizedCandidate) {
    return false;
  }

  return normalizedInput === normalizedCandidate;
}

function mapInventoryBook(book: FormattedBook): DashboardInventoryBook {
  return {
    id: Number(book.id ?? book.book_id),
    title: book.title,
    author: book.author,
    isbn: book.isbn || `ISBN-${book.id ?? book.book_id}000`,
    category: book.category || book.genre || 'Khác',
    location: book.location || 'Khu A',
    status: book.is_available ? 'Sẵn có' : 'Đang mượn',
    statusColor: book.is_available ? 'bg-green-500' : 'bg-tertiary',
    cover: book.cover,
  };
}

export default function AdminDashboard() {
  const [pendingRequests, setPendingRequests] = useState<BorrowRequest[]>([]);
  const [recentReturns, setRecentReturns] = useState<BorrowRequest[]>([]);
  const [inventoryBooks, setInventoryBooks] = useState<DashboardInventoryBook[]>([]);
  const [allRequests, setAllRequests] = useState<BorrowRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [quickForm, setQuickForm] = useState<QuickActionForm>({ memberId: '', bookId: '' });
  const [quickFeedback, setQuickFeedback] = useState<QuickActionFeedback | null>(null);
  const [loadingAction, setLoadingAction] = useState<'borrow' | 'return' | null>(null);

  const loadDashboard = async () => {
    try {
      const [books, requests, members] = await Promise.all([
        fetchBooks(),
        getAllRequests(),
        getAllMembers(),
      ]);

      setAllRequests(requests);
      setInventoryBooks(books.map(mapInventoryBook));

      const pending = requests.filter((request) => request.raw_status === 'pending');
      const returned = requests.filter((request) => request.raw_status === 'returned');
      const overdue = requests.filter(
        (request) => request.raw_status === 'borrowed' && Boolean(request.due_date),
      ).filter((request) => new Date(request.due_date as string) < new Date()).length;

      setPendingRequests(pending.slice(0, 5));
      setRecentReturns(returned.slice(0, 5));
      setStats({
        requests: pending.length,
        overdue,
        books: books.length,
        members: members.length,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const quickActionHint = useMemo(() => {
    if (!quickForm.memberId && !quickForm.bookId) {
      return 'Nhập Member ID và Book ID để xử lý nhanh.';
    }

    if (!quickForm.memberId || !quickForm.bookId) {
      return 'Cần nhập đầy đủ cả Member ID và Book ID.';
    }

    return `Đang sẵn sàng xử lý cho Member ${quickForm.memberId} và Book ${quickForm.bookId}.`;
  }, [quickForm.bookId, quickForm.memberId]);

  const findRequestByStatus = (status: BorrowRequest['raw_status']) => {
    return allRequests.find(
      (request) =>
        request.raw_status === status &&
        isMatchingIdentifier(quickForm.memberId, request.code) &&
        isMatchingIdentifier(quickForm.bookId, request.bookCode),
    );
  };

  const handleQuickBorrow = async () => {
    if (!quickForm.memberId || !quickForm.bookId) {
      setQuickFeedback({
        tone: 'error',
        message: 'Vui lòng nhập đầy đủ Member ID và Book ID.',
      });
      return;
    }

    const targetRequest = findRequestByStatus('pending');
    if (!targetRequest) {
      setQuickFeedback({
        tone: 'error',
        message: 'Không tìm thấy yêu cầu đang chờ duyệt cho cặp Member ID và Book ID này.',
      });
      return;
    }

    setLoadingAction('borrow');
    setQuickFeedback(null);

    try {
      await approveBorrow(targetRequest.id);
      setQuickFeedback({
        tone: 'success',
        message: `Đã cho mượn sách cho Member ${quickForm.memberId} với Book ${quickForm.bookId}.`,
      });
      emitToast({
        tone: 'success',
        title: 'Đã cho mượn sách',
        message: `Member ${quickForm.memberId} và Book ${quickForm.bookId} đã được xử lý.`,
      });
      await loadDashboard();
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        return;
      }

      const message = getErrorMessage(error, 'Không thể cho mượn sách lúc này.');
      setQuickFeedback({
        tone: 'error',
        message,
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleQuickReturn = async () => {
    if (!quickForm.memberId || !quickForm.bookId) {
      setQuickFeedback({
        tone: 'error',
        message: 'Vui lòng nhập đầy đủ Member ID và Book ID.',
      });
      return;
    }

    const targetRequest = findRequestByStatus('borrowed');
    if (!targetRequest) {
      setQuickFeedback({
        tone: 'error',
        message: 'Không tìm thấy phiếu đang mượn phù hợp để trả sách.',
      });
      return;
    }

    setLoadingAction('return');
    setQuickFeedback(null);

    try {
      await returnBook(targetRequest.id);
      setQuickFeedback({
        tone: 'success',
        message: `Đã nhận trả sách cho Member ${quickForm.memberId} với Book ${quickForm.bookId}.`,
      });
      emitToast({
        tone: 'success',
        title: 'Đã nhận trả sách',
        message: `Member ${quickForm.memberId} và Book ${quickForm.bookId} đã được cập nhật.`,
      });
      await loadDashboard();
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        return;
      }

      const message = getErrorMessage(error, 'Không thể trả sách lúc này.');
      setQuickFeedback({
        tone: 'error',
        message,
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePendingApprove = async (loanId: number) => {
    try {
      await approveBorrow(loanId);
      emitToast({ tone: 'success', title: 'Đã duyệt yêu cầu', message: `Phiếu #${loanId} đã được chuyển sang trạng thái mượn.` });
      await loadDashboard();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-bright p-6 rounded-xl scholar-shadow border border-surface-container-low">
          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <p className="text-outline text-xs font-bold uppercase tracking-wider">Yêu cầu mới</p>
          <h3 className="text-3xl font-bold mt-1">{stats.requests}</h3>
        </div>
        <div className="bg-surface-bright p-6 rounded-xl scholar-shadow border border-surface-container-low">
          <div className="w-12 h-12 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">event_busy</span>
          </div>
          <p className="text-outline text-xs font-bold uppercase tracking-wider">Quá hạn</p>
          <h3 className="text-3xl font-bold mt-1">{stats.overdue}</h3>
        </div>
        <div className="bg-surface-bright p-6 rounded-xl scholar-shadow border border-surface-container-low">
          <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">inventory</span>
          </div>
          <p className="text-outline text-xs font-bold uppercase tracking-wider">Tổng đầu sách</p>
          <h3 className="text-3xl font-bold mt-1">{stats.books.toLocaleString('vi-VN')}</h3>
        </div>
        <div className="bg-surface-bright p-6 rounded-xl scholar-shadow border border-surface-container-low">
          <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">person_search</span>
          </div>
          <p className="text-outline text-xs font-bold uppercase tracking-wider">Thành viên</p>
          <h3 className="text-3xl font-bold mt-1">{stats.members.toLocaleString('vi-VN')}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <section className="bg-surface-bright p-8 rounded-xl scholar-shadow border border-surface-container-low relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary filled">bolt</span>
              Xử lý nhanh
            </h3>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <div>
                <label className="block text-xs font-bold text-outline mb-1 uppercase tracking-wider">
                  Mã thành viên (Member ID)
                </label>
                <input
                  type="text"
                  value={quickForm.memberId}
                  onChange={(event) =>
                    setQuickForm((current) => ({ ...current, memberId: event.target.value }))
                  }
                  placeholder="Ví dụ: 1"
                  className="w-full bg-surface-container border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-outline mb-1 uppercase tracking-wider">
                  Mã sách (Book ID)
                </label>
                <input
                  type="text"
                  value={quickForm.bookId}
                  onChange={(event) =>
                    setQuickForm((current) => ({ ...current, bookId: event.target.value }))
                  }
                  placeholder="Ví dụ: 101"
                  className="w-full bg-surface-container border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
              <div className="rounded-lg bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant">
                {quickFeedback ? (
                  <span
                    className={
                      quickFeedback.tone === 'success'
                        ? 'text-green-700 font-semibold'
                        : quickFeedback.tone === 'error'
                          ? 'text-error font-semibold'
                          : 'text-on-surface-variant'
                    }
                  >
                    {quickFeedback.message}
                  </span>
                ) : (
                  quickActionHint
                )}
              </div>
              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleQuickBorrow}
                  disabled={loadingAction !== null}
                  className="bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-wait"
                >
                  <span className="material-symbols-outlined text-sm">output</span>
                  {loadingAction === 'borrow' ? 'Đang xử lý...' : 'Cho mượn'}
                </button>
                <button
                  type="button"
                  onClick={handleQuickReturn}
                  disabled={loadingAction !== null}
                  className="bg-primary-container text-primary py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-200 transition-all disabled:opacity-60 disabled:cursor-wait"
                >
                  <span className="material-symbols-outlined text-sm">input</span>
                  {loadingAction === 'return' ? 'Đang xử lý...' : 'Trả sách'}
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="lg:col-span-2">
          <section className="bg-surface-bright rounded-xl scholar-shadow border border-surface-container-low overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-surface-container flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Duyệt mượn mới</h3>
                <p className="text-xs text-outline mt-1">
                  Danh sách các yêu cầu đang chờ xử lý từ sinh viên
                </p>
              </div>
              <button className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                <span className="material-symbols-outlined text-base">filter_list</span>
                Lọc
              </button>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-container text-xs font-bold uppercase tracking-widest text-outline">
                    <th className="px-6 py-4">Thành viên</th>
                    <th className="px-6 py-4">Sách yêu cầu</th>
                    <th className="px-6 py-4">Ngày yêu cầu</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-surface-container/50 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${request.roleColor}`}>
                            {request.role}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{request.name}</p>
                            <p className="text-[10px] text-outline">MSSV: {request.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-on-surface">{request.book}</p>
                            <p className="text-[10px] text-outline">Mã: {request.bookCode}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant">{request.date}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handlePendingApprove(request.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:opacity-90"
                          >
                            Duyệt
                          </button>
                          <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-surface-container-low flex items-center justify-center border-t border-surface-container mt-auto">
              <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">
                Xem tất cả yêu cầu
              </button>
            </div>
          </section>
        </div>
      </div>

      <section className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-container">
          <div>
            <h3 className="text-2xl font-bold text-on-surface">Quản lý kho sách</h3>
            <p className="text-on-surface-variant text-sm mt-1">
              Quản lý danh mục, tình trạng và số lượng sách hiện có
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-primary text-white rounded-xl font-semibold flex items-center gap-2 scholar-shadow hover:-translate-y-0.5 transition-all">
              <span className="material-symbols-outlined">add</span>
              Thêm sách mới
            </button>
            <button className="p-3 bg-surface-container text-on-surface-variant rounded-xl hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined">file_download</span>
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-full bg-primary text-white text-xs font-medium">Tất cả</button>
              <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium hover:bg-surface-container-high">Sách giấy</button>
              <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium hover:bg-surface-container-high">E-Book</button>
              <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium hover:bg-surface-container-high">Tài liệu tham khảo</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-outline">Sắp xếp:</span>
              <select aria-label="Sắp xếp danh sách sách" className="text-xs font-medium border-none bg-transparent focus:ring-0 cursor-pointer outline-none">
                <option>Mới nhất</option>
                <option>Tên A-Z</option>
                <option>Số lượng</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-surface-container">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  <th className="px-6 py-4">Bìa sách</th>
                  <th className="px-6 py-4">Thông tin sách</th>
                  <th className="px-6 py-4">Phân loại</th>
                  <th className="px-6 py-4">Vị trí kho</th>
                  <th className="px-6 py-4">Tình trạng</th>
                  <th className="px-6 py-4 text-right">Quản lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {inventoryBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-surface-container/30 transition-all">
                    <td className="px-6 py-4">
                      <div className="w-12 h-16 rounded-lg bg-surface-container-high overflow-hidden border border-surface-container">
                        <img src={book.cover} alt={book.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-bold text-on-surface line-clamp-1">{book.title}</p>
                        <p className="text-xs text-outline mt-0.5">Tác giả: {book.author}</p>
                        <p className="text-[10px] font-mono text-primary mt-1">ISBN: {book.isbn}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">{book.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${book.statusColor}`}></div>
                        <span className="text-xs font-medium">{book.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 rounded-lg text-primary hover:bg-primary-container transition-all">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-all">
                          <span className="material-symbols-outlined text-lg">history</span>
                        </button>
                        <button className="p-2 rounded-lg text-tertiary hover:bg-tertiary-container transition-all">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-outline">Hiển thị 1 - 10 trong tổng số {inventoryBooks.length} sách</p>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-surface-container hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white font-bold text-xs">1</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-surface-container hover:bg-surface-container transition-all text-xs">2</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-surface-container hover:bg-surface-container transition-all text-xs">3</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-surface-container hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-bright rounded-2xl scholar-shadow border border-surface-container-low overflow-hidden">
        <div className="p-6 border-b border-surface-container flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary">published_with_changes</span>
          <h3 className="text-lg font-bold text-on-surface">Xác nhận trả sách gần đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <tbody className="divide-y divide-surface-container">
              {recentReturns.length === 0 ? (
                <tr>
                  <td className="px-8 py-6 text-sm text-on-surface-variant">
                    Chưa có giao dịch trả sách nào gần đây.
                  </td>
                </tr>
              ) : (
                recentReturns.map((request) => (
                  <tr key={request.id} className="group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-green-500 bg-green-50 p-2 rounded-full">
                          check_circle
                        </span>
                        <div>
                          <p className="text-sm font-semibold">
                            {request.name} đã trả "{request.book}"
                          </p>
                          <p className="text-[10px] text-outline mt-0.5">
                            Hoàn tất lúc: {request.return_date || request.date}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="px-4 py-2 bg-surface-container text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container-high transition-all">
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-auto border-t border-surface-container py-6 flex flex-col md:flex-row items-center justify-between text-[10px] font-bold text-outline uppercase tracking-widest">
        <p>© 2023 HCMUE DIGITAL LIBRARY SYSTEM - LIBRARIAN PANEL V2.4</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-primary transition-colors">Hướng dẫn sử dụng</a>
          <a href="#" className="hover:text-primary transition-colors">Báo cáo sự cố</a>
          <a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a>
        </div>
      </footer>
    </div>
  );
}
