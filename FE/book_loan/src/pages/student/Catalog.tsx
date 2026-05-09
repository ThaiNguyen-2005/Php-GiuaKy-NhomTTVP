import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { requestBorrow } from '../../api/borrowApi';
import { fetchBooks } from '../../api/bookApi';
import { getErrorMessage, isUnauthorizedError } from '../../lib/errors';
import { emitToast } from '../../notifications/events';
import type { FormattedBook } from '../../types/book';

type AvailabilityFilter = 'all' | 'available' | 'unavailable';
type SortKey = 'title' | 'newest' | 'available';

const AVAILABILITY_OPTIONS: Array<{ label: string; value: AvailabilityFilter }> = [
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Còn sách', value: 'available' },
  { label: 'Hết sách', value: 'unavailable' },
];

const SORT_OPTIONS: Array<{ label: string; value: SortKey }> = [
  { label: 'Tên A-Z', value: 'title' },
  { label: 'Năm xuất bản mới', value: 'newest' },
  { label: 'Còn nhiều bản nhất', value: 'available' },
];

function readAvailability(value: string | null): AvailabilityFilter {
  return value === 'available' || value === 'unavailable' ? value : 'all';
}

function readSort(value: string | null): SortKey {
  return value === 'newest' || value === 'available' ? value : 'title';
}

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBook, setSelectedBook] = useState<FormattedBook | null>(null);
  const [books, setBooks] = useState<FormattedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const availability = readAvailability(searchParams.get('availability'));
  const sort = readSort(searchParams.get('sort'));

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

  useEffect(() => {
    const selectedId = Number(searchParams.get('book'));

    if (!selectedId || books.length === 0) {
      return;
    }

    const match = books.find((book) => book.id === selectedId);

    if (match) {
      setSelectedBook(match);
    }
  }, [books, searchParams]);

  const categories = useMemo(() => {
    return Array.from(new Set(books.map((book) => book.category).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'vi'),
    );
  }, [books]);

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const nextBooks = books.filter((book) => {
      const matchesQuery =
        !normalizedQuery ||
        [book.title, book.author, book.category, book.genre, book.location, book.isbn]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory = category === 'all' || book.category === category;
      const matchesAvailability =
        availability === 'all' ||
        (availability === 'available' && book.is_available) ||
        (availability === 'unavailable' && !book.is_available);

      return matchesQuery && matchesCategory && matchesAvailability;
    });

    return [...nextBooks].sort((first, second) => {
      if (sort === 'newest') {
        return (second.published_year ?? 0) - (first.published_year ?? 0);
      }

      if (sort === 'available') {
        return second.available_quantity - first.available_quantity;
      }

      return first.title.localeCompare(second.title, 'vi');
    });
  }, [availability, books, category, query, sort]);

  const updateFilter = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (!value || value === 'all' || (key === 'sort' && value === 'title')) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    if (key !== 'book') {
      nextParams.delete('book');
      setSelectedBook(null);
    }

    setSearchParams(nextParams, { replace: true });
  };

  const resetFilters = () => {
    setSelectedBook(null);
    setSearchParams({}, { replace: true });
  };

  const openBook = (book: FormattedBook) => {
    if (!book.is_available) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('book', String(book.id));
    setSelectedBook(book);
    setSearchParams(nextParams, { replace: true });
  };

  const closeBook = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('book');
    setSelectedBook(null);
    setSearchParams(nextParams, { replace: true });
  };

  const handleBorrow = async () => {
    if (!selectedBook || !selectedBook.is_available) {
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
      closeBook();
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

  const selectedIsAvailable = Boolean(selectedBook?.is_available);

  return (
    <div className="relative flex h-full">
      <aside className="custom-scrollbar w-72 shrink-0 overflow-y-auto border-r border-surface-container-high bg-surface-bright p-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">Bộ lọc</h2>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-medium text-primary hover:underline"
          >
            Xóa tất cả
          </button>
        </div>

        <div className="space-y-8">
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-outline">
              Tìm trong danh mục
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => updateFilter('q', event.target.value)}
              placeholder="Tên sách, tác giả, ISBN..."
              className="w-full rounded-lg border border-surface-container-high bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-outline">
              Trạng thái kho
            </p>
            <div className="space-y-2">
              {AVAILABILITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant"
                >
                  <input
                    type="radio"
                    name="availability"
                    checked={availability === option.value}
                    onChange={() => updateFilter('availability', option.value)}
                    className="text-primary focus:ring-primary"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-outline">
              Phân loại
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => updateFilter('category', 'all')}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  category === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Tất cả phân loại
              </button>
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => updateFilter('category', item)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    category === item
                      ? 'bg-primary text-white'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-outline">
              Sắp xếp
            </span>
            <select
              value={sort}
              onChange={(event) => updateFilter('sort', event.target.value)}
              className="w-full rounded-lg border border-surface-container-high bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </aside>

      <section className="custom-scrollbar flex-1 overflow-y-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Danh mục sách</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Hiển thị {filteredBooks.length} trong tổng số {books.length} kết quả
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            <div className="col-span-full py-10 text-center">Đang tải biểu mẫu sách...</div>
          ) : filteredBooks.length === 0 ? (
            <div className="col-span-full rounded-lg border border-surface-container bg-surface-bright py-12 text-center text-sm text-on-surface-variant">
              Không tìm thấy sách phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            filteredBooks.map((book) => (
              <button
                key={book.id}
                type="button"
                disabled={!book.is_available}
                className={`group text-left ${
                  book.is_available
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed opacity-75'
                }`}
                onClick={() => openBook(book)}
              >
                <div
                  className={`scholar-shadow relative mb-4 aspect-[3/4] overflow-hidden rounded-xl bg-surface-container transition-transform duration-300 ${
                    book.is_available ? 'group-hover:-translate-y-2' : ''
                  }`}
                >
                  <img
                    src={book.cover}
                    alt={book.title}
                    loading="lazy"
                    decoding="async"
                    className={`h-full w-full object-cover ${book.is_available ? '' : 'grayscale-[0.55]'}`}
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
                {book.is_available ? (
                  <p className="mt-2 text-[10px] uppercase text-outline">Kệ: {book.location}</p>
                ) : (
                  <p className="mt-2 text-[10px] font-medium text-error">
                    Đã hết bản sẵn sàng cho mượn
                  </p>
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
                type="button"
                onClick={closeBook}
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
                  type="button"
                  onClick={closeBook}
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
                  <span
                    className={`mt-1 flex items-center gap-1 font-bold ${
                      selectedIsAvailable ? 'text-green-600' : 'text-error'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        selectedIsAvailable ? 'bg-green-600' : 'bg-error'
                      }`}
                    />
                    {selectedIsAvailable
                      ? `${selectedBook.available_quantity} bản sẵn sàng cho mượn`
                      : 'Hiện chưa có bản sẵn sàng cho mượn'}
                  </span>
                </div>
                {selectedIsAvailable ? (
                  <button
                    type="button"
                    onClick={handleBorrow}
                    disabled={isBorrowing}
                    className="rounded-xl bg-tertiary px-8 py-3 font-bold text-white shadow-lg shadow-tertiary/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isBorrowing ? 'Đang gửi...' : 'Mượn ngay'}
                  </button>
                ) : (
                  <p className="max-w-xs text-right text-sm font-medium text-on-surface-variant">
                    Sách đã hết bản, vui lòng chọn tài liệu khác hoặc quay lại sau.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
