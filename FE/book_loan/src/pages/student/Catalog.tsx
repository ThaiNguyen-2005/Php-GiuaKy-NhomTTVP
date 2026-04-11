import React, { useEffect, useState } from 'react';
import { requestBorrow } from '../../api/borrowApi';
import { fetchBooks } from '../../api/bookApi';
import { getErrorMessage, isUnauthorizedError } from '../../lib/errors';
import { emitToast } from '../../notifications/events';
import type { FormattedBook } from '../../types/book';

export default function Catalog() {
  const [selectedBook, setSelectedBook] = useState<FormattedBook | null>(null);
  const [books, setBooks] = useState<FormattedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);

  useEffect(() => {
    fetchBooks()
      .then((data) => {
        setBooks(data);
      })
      .catch((error: unknown) => {
        console.error(error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleBorrow = async () => {
    if (!selectedBook) {
      return;
    }

    setIsBorrowing(true);

    try {
      const response = await requestBorrow(selectedBook.id);
      emitToast({
        tone: 'success',
        title: 'Đã gửi yêu cầu mượn',
        message: response.message,
      });
      setSelectedBook(null);
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        return;
      }

      const message = getErrorMessage(error, 'Lỗi khi yêu cầu mượn sách');
      emitToast({
        tone: 'error',
        title: 'Không thể gửi yêu cầu mượn',
        message,
      });
    } finally {
      setIsBorrowing(false);
    }
  };

  return (
    <div className="relative flex h-full">
      <aside className="custom-scrollbar w-72 shrink-0 overflow-y-auto border-r border-surface-container-high bg-surface-bright p-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">Bộ lọc</h2>
          <button className="text-xs font-medium text-primary hover:underline">Xóa tất cả</button>
        </div>
      </aside>

      <section className="custom-scrollbar flex-1 overflow-y-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Danh mục sách</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Hiển thị {books.length} kết quả
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            <div className="col-span-full py-10 text-center">Đang tải biểu mẫu sách...</div>
          ) : (
            books.map((book) => (
              <button
                key={book.id}
                type="button"
                className={`group cursor-pointer text-left ${book.status === 'Hết sách' ? 'opacity-80' : ''}`}
                onClick={() => setSelectedBook(book)}
              >
                <div className="scholar-shadow relative mb-4 aspect-[3/4] overflow-hidden rounded-xl bg-surface-container transition-transform duration-300 group-hover:-translate-y-2">
                  <img
                    src={book.cover}
                    alt={book.title}
                    loading="lazy"
                    decoding="async"
                    className={`h-full w-full object-cover ${book.status === 'Hết sách' ? 'grayscale-[0.5]' : ''}`}
                  />
                  <div className="absolute right-3 top-3">
                    <span
                      className={`${book.statusColor} rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-tight text-white`}
                    >
                      {book.status}
                    </span>
                  </div>
                </div>
                <h4 className="line-clamp-2 font-bold text-on-surface transition-colors group-hover:text-primary">
                  {book.title}
                </h4>
                <p className="mt-1 text-xs text-on-surface-variant">{book.author}</p>
                {book.status === 'Hết sách' ? (
                  <p className="mt-2 text-[10px] font-medium text-error">Hết sách</p>
                ) : (
                  <p className="mt-2 text-[10px] uppercase text-outline">Kệ: {book.location}</p>
                )}
              </button>
            ))
          )}
        </div>
      </section>

      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-surface-bright shadow-2xl md:flex-row">
            <div className="relative bg-surface-container md:w-2/5">
              <img
                src={selectedBook.cover}
                alt={selectedBook.title}
                decoding="async"
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            </div>
            <div className="custom-scrollbar flex flex-col overflow-y-auto p-8 md:w-3/5 md:p-12">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-primary-container px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                    {selectedBook.category}
                  </span>
                  <h2 className="mt-4 text-3xl font-bold text-on-surface">{selectedBook.title}</h2>
                  <p className="mt-2 text-lg text-on-surface-variant">{selectedBook.author}</p>
                </div>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-3xl">close</span>
                </button>
              </div>
              <div className="mt-12 flex items-center justify-between gap-6 border-t border-surface-container-high pt-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-outline">
                    Trạng thái tại kho
                  </span>
                  <span className="mt-1 flex items-center gap-1 font-bold text-green-600">
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    Sẵn sàng cho mượn
                  </span>
                </div>
                <button
                  onClick={handleBorrow}
                  disabled={isBorrowing}
                  className="rounded-xl bg-tertiary px-8 py-3 font-bold text-white shadow-lg shadow-tertiary/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-wait disabled:opacity-60"
                >
                  {isBorrowing ? 'Đang gửi...' : 'Mượn ngay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
