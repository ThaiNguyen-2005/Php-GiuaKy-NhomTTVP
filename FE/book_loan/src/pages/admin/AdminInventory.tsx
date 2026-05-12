import React, { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  addBorrowableBook,
  addDigitalResource,
  deleteBook,
  fetchBorrowableBooks,
  fetchDigitalResourceBooks,
  updateBorrowableBook,
  updateDigitalResource,
  uploadDigitalFile,
  type BookPayload,
} from '../../api/bookApi';
import EmptyState from '../../components/EmptyState';
import { applyImageFallback } from '../../lib/display';
import { getErrorMessage, isUnauthorizedError } from '../../lib/errors';
import { emitToast } from '../../notifications/events';
import type { FormattedBook } from '../../types/book';

type InventoryTab = 'borrow' | 'digital';

type InventoryFormData = {
  id: number;
  title: string;
  author: string;
  category: string;
  location: string;
  cover: string;
  quantity: number;
  published_year: string;
  file_format: string;
  file_size: string;
  digital_file_name: string;
  has_digital_file: boolean;
};

const EMPTY_FORM: InventoryFormData = {
  id: 0,
  title: '',
  author: '',
  category: 'Giáo trình',
  location: '',
  cover: '',
  quantity: 1,
  published_year: '',
  file_format: '',
  file_size: '',
  digital_file_name: '',
  has_digital_file: false,
};

const PAGE_SIZE = 6;

function getPageWindow(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, start + 2);
  const adjustedStart = Math.max(1, end - 2);

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

function formatFileSize(file: File) {
  return `${Math.max(1, Math.ceil(file.size / 1024))} KB`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toFormData(book: FormattedBook): InventoryFormData {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    category: book.category,
    location: book.location,
    cover: book.cover,
    quantity: book.quantity || 1,
    published_year: book.published_year ? String(book.published_year) : '',
    file_format: book.file_format || '',
    file_size: book.file_size || '',
    digital_file_name: book.digital_file_name || '',
    has_digital_file: Boolean(book.has_digital_file),
  };
}

function buildPayload(formData: InventoryFormData, tab: InventoryTab): BookPayload {
  const publishedYear = Number(formData.published_year);

  return {
    title: formData.title.trim(),
    author: formData.author.trim(),
    category: formData.category.trim(),
    genre: formData.category.trim(),
    published_year: Number.isFinite(publishedYear) && publishedYear > 0 ? publishedYear : undefined,
    location: tab === 'borrow' ? formData.location.trim() : undefined,
    cover: formData.cover.trim() || undefined,
    quantity: tab === 'borrow' ? formData.quantity : undefined,
    resource_type: tab === 'digital' ? formData.category.trim() : undefined,
  };
}

export default function AdminInventory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'digital' ? 'digital' : 'borrow';
  const [activeTab, setActiveTab] = useState<InventoryTab>(initialTab);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [borrowBooks, setBorrowBooks] = useState<FormattedBook[]>([]);
  const [digitalBooks, setDigitalBooks] = useState<FormattedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isFiltering, setIsFiltering] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<InventoryFormData>(EMPTY_FORM);
  const [selectedDigitalFile, setSelectedDigitalFile] = useState<File | null>(null);

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const books = activeTab === 'borrow' ? borrowBooks : digitalBooks;
  const isDigitalTab = activeTab === 'digital';

  const loadBooks = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      setLoadError(null);
      const [borrowable, digital] = await Promise.all([
        fetchBorrowableBooks(),
        fetchDigitalResourceBooks(),
      ]);
      setBorrowBooks(borrowable);
      setDigitalBooks(digital);
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        return;
      }

      const message = getErrorMessage(error, 'Không thể tải dữ liệu quản lý sách.');
      setLoadError(message);
      emitToast({ tone: 'error', title: 'Không thể tải danh sách sách', message });
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadBooks();
  }, []);

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setActiveTab(searchParams.get('tab') === 'digital' ? 'digital' : 'borrow');
    setPage(1);
  }, [searchParams]);

  const filteredBooks = useMemo(() => {
    const normalizedQuery = deferredSearchTerm.trim().toLowerCase();

    if (!normalizedQuery) {
      return books;
    }

    return books.filter((book) =>
      [book.title, book.author, book.category, book.location, book.isbn, book.file_format]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [books, deferredSearchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const visibleBooks = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredBooks.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredBooks, page]);
  const pageNumbers = useMemo(() => getPageWindow(page, totalPages), [page, totalPages]);
  const startItem = filteredBooks.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(filteredBooks.length, page * PAGE_SIZE);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const updateTab = (tab: InventoryTab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);
    nextParams.delete('search');
    setSearchParams(nextParams, { replace: true });
    setActiveTab(tab);
    setSearchTerm('');
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setIsFiltering(true);

    startTransition(() => {
      setSearchTerm(value);
      setPage(1);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('tab', activeTab);

      if (value.trim()) {
        nextParams.set('search', value);
      } else {
        nextParams.delete('search');
      }

      setSearchParams(nextParams, { replace: true });
      setIsFiltering(false);
    });
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      ...EMPTY_FORM,
      quantity: activeTab === 'borrow' ? 1 : 0,
      category: activeTab === 'borrow' ? 'Giáo trình' : 'PDF',
    });
    setSelectedDigitalFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (book: FormattedBook) => {
    setModalMode('edit');
    setFormData(toFormData(book));
    setSelectedDigitalFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDigitalFile(null);
  };

  const handleDelete = async (book: FormattedBook) => {
    if (!confirm(`Xóa "${book.title}"?`)) {
      return;
    }

    try {
      await deleteBook(book.id);
      await loadBooks(false);
      emitToast({
        tone: 'success',
        title: 'Đã xóa sách',
        message: `Đã xóa "${book.title}".`,
      });
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        return;
      }

      const message = getErrorMessage(error, 'Không thể xóa sách này.');
      emitToast({ tone: 'error', title: 'Không thể xóa sách', message });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isDigitalTab && modalMode === 'add' && !selectedDigitalFile) {
      emitToast({
        tone: 'error',
        title: 'Cần tệp số',
        message: 'Hãy chọn tệp PDF, âm thanh, EPUB hoặc slide trước khi lưu tài nguyên số này.',
      });
      return;
    }

    try {
      const payload = buildPayload(formData, activeTab);
      const savedBook =
        activeTab === 'borrow'
          ? modalMode === 'add'
            ? await addBorrowableBook(payload)
            : await updateBorrowableBook(formData.id, payload)
          : modalMode === 'add'
            ? await addDigitalResource(payload)
            : await updateDigitalResource(formData.id, payload);

      if (activeTab === 'digital' && selectedDigitalFile) {
        await uploadDigitalFile(savedBook.id, selectedDigitalFile);
      }

      closeModal();
      await loadBooks(false);
      emitToast({
        tone: 'success',
        title: activeTab === 'digital' ? 'Đã lưu tài nguyên số' : 'Đã lưu sách mượn',
        message:
          activeTab === 'digital'
            ? 'Thông tin và tệp tài nguyên số đã được cập nhật.'
            : 'Kho sách mượn đã được cập nhật.',
      });
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        return;
      }

      const message = getErrorMessage(error, 'Không thể lưu bản ghi này.');
      emitToast({ tone: 'error', title: 'Không thể lưu bản ghi', message });
    }
  };

  const handlePrintBarcodes = () => {
    if (filteredBooks.length === 0) {
      emitToast({
        tone: 'info',
        title: 'Không có gì để in',
        message: 'Bộ lọc sách mượn hiện tại không có dữ liệu.',
      });
      return;
    }

    const printWindow = window.open('', '_blank', 'width=960,height=720');

    if (!printWindow) {
      emitToast({
        tone: 'error',
        title: 'Không thể mở cửa sổ in',
        message: 'Vui lòng cho phép cửa sổ bật lên để in nhãn mã vạch.',
      });
      return;
    }

    const labels = filteredBooks
      .map((book) => {
        const code = `SACH-${String(book.id).padStart(5, '0')}`;
        const bars = String(book.id)
          .padStart(12, '0')
          .split('')
          .map((digit) => {
            const width = Number(digit) % 3 === 0 ? 3 : 1 + (Number(digit) % 3);
            return `<span style="display:inline-block;width:${width}px;height:48px;background:#111;margin-right:2px"></span>`;
          })
          .join('');

        return `
          <article class="label">
            <strong>${escapeHtml(book.title)}</strong>
            <small>${escapeHtml(book.author)} | ${escapeHtml(book.location)}</small>
            <div class="barcode">${bars}</div>
            <code>${escapeHtml(code)}</code>
          </article>
        `;
      })
      .join('');

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Mã vạch sách</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 24px; font-family: Arial, sans-serif; color: #111827; }
            h1 { margin: 0 0 16px; font-size: 20px; }
            .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
            .label { min-height: 150px; border: 1px dashed #94a3b8; padding: 12px; page-break-inside: avoid; }
            strong { display: block; font-size: 12px; line-height: 1.3; min-height: 32px; }
            small { display: block; margin-top: 4px; color: #64748b; font-size: 10px; }
            .barcode { margin: 12px 0 8px; white-space: nowrap; overflow: hidden; }
            code { font-size: 11px; font-weight: 700; }
            @media print { body { margin: 12mm; } }
          </style>
        </head>
        <body>
          <h1>Nhãn mã vạch sách</h1>
          <main class="grid">${labels}</main>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Quản lý sách</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Quản lý kho sách vật lý tách riêng khỏi các tệp PDF/âm thanh tải xuống.
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'borrow' ? (
            <button
              type="button"
              onClick={handlePrintBarcodes}
              className="flex items-center gap-2 rounded-xl bg-surface-container px-5 py-2.5 font-medium text-on-surface transition-all hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              In mã vạch
            </button>
          ) : null}
          <button
            type="button"
            aria-label={isDigitalTab ? 'Thêm tài nguyên số' : 'Thêm sách mượn'}
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {isDigitalTab ? 'Thêm tài nguyên số' : 'Thêm sách mượn'}
          </button>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Loại quản lý sách"
        className="flex w-fit gap-2 rounded-xl bg-surface-container-low p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'borrow'}
          onClick={() => updateTab('borrow')}
          className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'borrow'
              ? 'bg-surface-bright text-primary scholar-shadow'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Sách mượn
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'digital'}
          onClick={() => updateTab('digital')}
          className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'digital'
              ? 'bg-surface-bright text-primary scholar-shadow'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Tài nguyên số
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-surface-container-low bg-surface-bright scholar-shadow">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container bg-slate-50/50 p-6">
          <div className="relative w-full flex-1 md:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder={
                isDigitalTab
                  ? 'Tìm theo tiêu đề, tác giả, định dạng...'
                  : 'Tìm theo tiêu đề, tác giả, kệ...'
              }
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="w-full rounded-xl border border-surface-container-high bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-outline">
            {isFiltering ? 'Đang lọc...' : `${filteredBooks.length} bản ghi`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <th className="px-6 py-4">Bìa</th>
                <th className="px-6 py-4">Chi tiết</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">{isDigitalTab ? 'Tệp số' : 'Kệ'}</th>
                <th className="px-6 py-4">{isDigitalTab ? 'Lượt tải' : 'Tình trạng'}</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-outline">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8">
                    <EmptyState icon="error" title="Không thể tải dữ liệu" message={loadError} />
                  </td>
                </tr>
              ) : visibleBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8">
                    <EmptyState
                      icon="search_off"
                      title={isDigitalTab ? 'Không tìm thấy tài nguyên số' : 'Không tìm thấy sách mượn'}
                      message={
                        isDigitalTab
                          ? 'Tải lên tệp PDF/âm thanh hoặc đổi từ khóa tìm kiếm.'
                          : 'Thêm sách mượn hoặc đổi từ khóa tìm kiếm.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                visibleBooks.map((book) => (
                  <tr key={book.id} className="transition-all hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="h-16 w-12 overflow-hidden rounded-lg border border-surface-container bg-surface-container-high shadow-sm">
                        <img
                          src={book.cover}
                          alt={book.title}
                          onError={(event) => applyImageFallback(event.currentTarget)}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="line-clamp-1 text-sm font-bold text-on-surface">
                          {book.title}
                        </p>
                        <p className="mt-0.5 text-xs text-outline">Tác giả: {book.author}</p>
                        <p className="mt-1 inline-block rounded bg-primary/5 px-2 py-0.5 font-mono text-[10px] text-primary">
                          Mã: {book.id}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md border border-surface-container bg-surface-container-high px-2 py-1 text-[10px] font-bold uppercase text-on-surface-variant">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      {isDigitalTab ? (
                        <div className="space-y-1">
                          <p className="font-semibold text-on-surface">
                            {book.digital_file_name || 'Chưa đính kèm tệp'}
                          </p>
                          <p className="text-outline">
                            {[book.file_format, book.file_size].filter(Boolean).join(' - ') || 'Chờ tải lên'}
                          </p>
                        </div>
                      ) : (
                        book.location
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isDigitalTab ? (
                        <span className="text-xs font-bold text-slate-700">
                          {Number(book.download_count ?? 0).toLocaleString('vi-VN')}
                        </span>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${book.statusColor}`} />
                            <span className="text-xs font-bold text-slate-700">{book.status}</span>
                          </div>
                          <p className="mt-1 text-[10px] text-outline">
                            {book.available_quantity}/{book.quantity} bản
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(book)}
                          className="rounded-lg p-2 text-primary transition-all hover:bg-primary-container"
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(book)}
                          className="rounded-lg p-2 text-red-500 transition-all hover:bg-red-50"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-surface-container bg-white p-4">
          <p className="text-xs font-medium text-outline">
            Đang hiển thị {startItem} - {endItem} trên tổng số {filteredBooks.length} bản ghi
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-container transition-all hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                  pageNumber === page
                    ? 'bg-primary text-white'
                    : 'border border-surface-container text-on-surface transition-all hover:bg-surface-container'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-container transition-all hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-container bg-slate-50 p-6">
              <h3 className="text-xl font-bold text-slate-800">
                {modalMode === 'add'
                  ? isDigitalTab
                    ? 'Thêm tài nguyên số'
                    : 'Thêm sách mượn'
                  : isDigitalTab
                    ? 'Cập nhật tài nguyên số'
                    : 'Cập nhật sách mượn'}
              </h3>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="book-title" className="mb-1 block text-xs font-bold text-slate-600">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="book-title"
                    aria-label="Tiêu đề sách"
                    required
                    type="text"
                    value={formData.title}
                    onChange={(event) =>
                      setFormData({ ...formData, title: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="book-author" className="mb-1 block text-xs font-bold text-slate-600">
                    Tác giả <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="book-author"
                    aria-label="Tác giả sách"
                    required
                    type="text"
                    value={formData.author}
                    onChange={(event) =>
                      setFormData({ ...formData, author: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="book-category" className="mb-1 block text-xs font-bold text-slate-600">
                    {isDigitalTab ? 'Loại tài nguyên' : 'Danh mục'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="book-category"
                    required
                    type="text"
                    value={formData.category}
                    onChange={(event) =>
                      setFormData({ ...formData, category: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {!isDigitalTab ? (
                  <>
                    <div className="col-span-1">
                      <label htmlFor="book-location" className="mb-1 block text-xs font-bold text-slate-600">
                        Vị trí kệ
                      </label>
                      <input
                        id="book-location"
                        aria-label="Vị trí sách"
                        type="text"
                        value={formData.location}
                        onChange={(event) =>
                          setFormData({ ...formData, location: event.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="col-span-1">
                      <label htmlFor="book-quantity" className="mb-1 block text-xs font-bold text-slate-600">
                        Số lượng <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="book-quantity"
                        required
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            quantity: parseInt(event.target.value, 10) || 0,
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </>
                ) : null}

                <div className="col-span-1">
                  <label htmlFor="book-published-year" className="mb-1 block text-xs font-bold text-slate-600">
                    Năm xuất bản
                  </label>
                  <input
                    id="book-published-year"
                    type="number"
                    min="1900"
                    max="2100"
                    value={formData.published_year}
                    onChange={(event) =>
                      setFormData({ ...formData, published_year: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="book-cover" className="mb-1 block text-xs font-bold text-slate-600">
                    URL bìa
                  </label>
                  <input
                    id="book-cover"
                    type="text"
                    value={formData.cover}
                    onChange={(event) =>
                      setFormData({ ...formData, cover: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="https://..."
                  />
                </div>

                {isDigitalTab ? (
                  <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <label htmlFor="book-digital-file" className="mb-2 block text-xs font-bold text-slate-600">
                      Tệp số {modalMode === 'add' ? <span className="text-red-500">*</span> : null}
                    </label>
                    <input
                      id="book-digital-file"
                      aria-label="Tệp số"
                      type="file"
                      accept=".pdf,.epub,.mp3,.wav,.m4a,.ppt,.pptx,application/pdf,audio/*"
                      onChange={(event) => setSelectedDigitalFile(event.target.files?.[0] || null)}
                      className="w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
                    />
                    <div className="mt-3 rounded-lg bg-white px-3 py-2 text-xs text-slate-600">
                      {selectedDigitalFile ? (
                        <span>
                          Đã chọn: {selectedDigitalFile.name} ({formatFileSize(selectedDigitalFile)})
                        </span>
                      ) : formData.digital_file_name ? (
                        <span>
                          Đã đính kèm: {formData.digital_file_name}
                          {formData.file_format ? ` - ${formData.file_format}` : ''}
                          {formData.file_size ? ` - ${formData.file_size}` : ''}
                        </span>
                      ) : (
                        <span>Chưa có tệp số đính kèm.</span>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl bg-slate-100 px-5 py-2.5 font-bold text-slate-600 transition-colors hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  aria-label={isDigitalTab ? 'Lưu tài nguyên số' : 'Lưu sách mượn'}
                  className="rounded-xl bg-primary px-5 py-2.5 font-bold text-white shadow-md shadow-primary/20 transition-opacity hover:opacity-90"
                >
                  {isDigitalTab ? 'Lưu tài nguyên số' : 'Lưu sách mượn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
