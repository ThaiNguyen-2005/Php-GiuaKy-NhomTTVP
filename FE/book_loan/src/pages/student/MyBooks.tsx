import React, { useEffect, useState } from 'react';
import { getMyRequests } from '../../api/borrowApi';
import type { MemberBorrowRequest } from '../../types/request';

type BorrowedBookCard = {
  id: number;
  title: string;
  author: string;
  type: string;
  typeColor: string;
  cover?: string | null;
  borrowDate: string;
  dueDate: string;
  daysLeft: number;
  isWarning: boolean;
};

type HistoryBookRow = {
  id: number;
  title: string;
  author: string;
  borrowDate: string;
  returnDate: string;
};

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('vi-VN') : '—';
}

export default function MyBooks() {
  const [activeTab, setActiveTab] = useState<'borrowed' | 'history'>('borrowed');
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBookCard[]>([]);
  const [historyBooks, setHistoryBooks] = useState<HistoryBookRow[]>([]);

  useEffect(() => {
    getMyRequests()
      .then((data: MemberBorrowRequest[]) => {
        const borrowed = data.filter((req) => req.status === 'borrowed');
        const mappedBorrowed = borrowed.map((req) => {
          const dueDate = req.due_date ? new Date(req.due_date) : null;
          const diffDays = dueDate
            ? Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
            : 0;

          return {
            id: req.id,
            title: req.bookTitle,
            author: req.author,
            type: req.category || 'Tài liệu',
            typeColor: diffDays <= 3 ? 'text-tertiary' : 'text-primary',
            cover: req.cover,
            borrowDate: formatDate(req.borrow_date),
            dueDate: formatDate(req.due_date),
            daysLeft: diffDays,
            isWarning: diffDays <= 3,
          };
        });
        setBorrowedBooks(mappedBorrowed);

        const history = data
          .filter((req) => req.status === 'returned')
          .map((req) => ({
            id: req.id,
            title: req.bookTitle,
            author: req.author,
            borrowDate: formatDate(req.borrow_date),
            returnDate: formatDate(req.return_date),
          }));

        setHistoryBooks(history);
      })
      .catch((error: unknown) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Sách của tôi</h2>
          <p className="mt-1 text-on-surface-variant">
            Quản lý và theo dõi quá trình mượn trả tài liệu của bạn.
          </p>
        </div>
        <div className="flex w-fit gap-2 rounded-xl bg-surface-container-low p-1">
          <button
            onClick={() => setActiveTab('borrowed')}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === 'borrowed'
                ? 'bg-surface-bright text-primary scholar-shadow'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">auto_stories</span>
            Sách đang mượn
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === 'history'
                ? 'bg-surface-bright text-primary scholar-shadow'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">history_edu</span>
            Lịch sử mượn
          </button>
        </div>
      </div>

      {activeTab === 'borrowed' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {borrowedBooks.map((book) => (
            <div
              key={book.id}
              className={`flex flex-col gap-4 rounded-xl border-2 bg-surface-bright p-5 scholar-shadow transition-all ${
                book.isWarning ? 'border-tertiary/20' : 'border-transparent hover:-translate-y-1'
              }`}
            >
              <div className="flex gap-4">
                <div className="aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                  <img src={book.cover || ''} alt={book.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${book.typeColor}`}>
                      {book.type}
                    </span>
                    <h3 className="mt-1 line-clamp-2 text-sm font-bold text-on-surface">
                      {book.title}
                    </h3>
                    <p className="mt-1 text-xs text-on-surface-variant">{book.author}</p>
                  </div>
                  <div className="mt-4">
                    <div
                      className={`flex items-center gap-1 font-bold ${
                        book.isWarning ? 'text-tertiary' : 'text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">timer</span>
                      <span className="text-xs">Còn {book.daysLeft} ngày</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-outline-variant pt-4">
                <div className="text-[10px] text-on-surface-variant">
                  <p>Mượn: {book.borrowDate}</p>
                  <p>Hạn: {book.dueDate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-surface-bright scholar-shadow">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-xs uppercase tracking-widest text-on-surface-variant">
              <tr>
                <th className="px-6 py-4">Tên sách</th>
                <th className="px-6 py-4">Ngày mượn</th>
                <th className="px-6 py-4">Ngày trả</th>
                <th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {historyBooks.map((book) => (
                <tr key={book.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">{book.title}</p>
                    <p className="text-xs text-on-surface-variant">{book.author}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{book.borrowDate}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{book.returnDate}</td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-surface-container px-2 py-1 text-[10px] font-bold uppercase">
                      Đã trả
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
