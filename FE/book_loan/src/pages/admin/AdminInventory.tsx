import React, {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { addBook, deleteBook, fetchBooks, updateBook } from '../../api/bookApi';
import type { FormattedBook } from '../../types/book';

type InventoryFormData = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  location: string;
  cover: string;
  is_available: boolean;
  quantity: number;
};

const EMPTY_FORM: InventoryFormData = {
  id: 0,
  title: '',
  author: '',
  isbn: '',
  category: 'Giáo trình',
  location: '',
  cover: '',
  is_available: true,
  quantity: 1,
};

const PAGE_SIZE = 6;

function getPageWindow(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, start + 2);
  const adjustedStart = Math.max(1, end - 2);

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export default function AdminInventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState<FormattedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isFiltering, setIsFiltering] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<InventoryFormData>(EMPTY_FORM);

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const loadBooks = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const data = await fetchBooks();
      setBooks(data);
    } catch (error) {
      console.error(error);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    const normalizedQuery = deferredSearchTerm.trim().toLowerCase();

    if (!normalizedQuery) {
      return books;
    }

    return books.filter((book) => {
      const searchSource = [
        book.title,
        book.author,
        book.category,
        book.location,
        book.isbn,
      ]
        .join(' ')
        .toLowerCase();

      return searchSource.includes(normalizedQuery);
    });
  }, [books, deferredSearchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const visibleBooks = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredBooks.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredBooks, page]);

  const pageNumbers = useMemo(() => getPageWindow(page, totalPages), [page, totalPages]);

  const openAddModal = () => {
    setModalMode('add');
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (book: FormattedBook) => {
    setModalMode('edit');
    setFormData({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      location: book.location,
      cover: book.cover,
      is_available: book.status !== 'Hết sách',
      quantity: book.quantity || 1,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sách này?')) {
      return;
    }

    try {
      await deleteBook(id);
      await loadBooks(false);
    } catch (error: any) {
      alert(error.message || 'Lỗi khi xóa');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (modalMode === 'add') {
        await addBook(formData);
      } else {
        await updateBook(formData.id, formData);
      }

      setIsModalOpen(false);
      await loadBooks(false);
    } catch (error: any) {
      alert(error.message || 'Lỗi khi lưu sách');
    }
  };

  const handleSearchChange = (value: string) => {
    setIsFiltering(true);

    startTransition(() => {
      setSearchTerm(value);
      setPage(1);
      setIsFiltering(false);
    });
  };

  const startItem = filteredBooks.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(filteredBooks.length, page * PAGE_SIZE);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Quản lý kho sách</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Danh mục, số lượng và tình trạng sách trong thư viện HCMUE.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-surface-container px-5 py-2.5 font-medium text-on-surface transition-all hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-sm">print</span>
            In mã vạch
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Thêm đầu sách
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-surface-container-low bg-surface-bright scholar-shadow">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container bg-slate-50/50 p-6">
          <div className="relative w-full flex-1 md:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm theo tên sách, tác giả, ISBN..."
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="w-full rounded-xl border border-surface-container-high bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-outline">
            {isFiltering ? 'Đang lọc...' : `${filteredBooks.length} kết quả`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <th className="px-6 py-4">Bìa sách</th>
                <th className="px-6 py-4">Thông tin sách</th>
                <th className="px-6 py-4">Phân loại</th>
                <th className="px-6 py-4">Vị trí kho</th>
                <th className="px-6 py-4">Tình trạng</th>
                <th className="px-6 py-4 text-right">Quản lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-outline">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : visibleBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-outline">
                    Không tìm thấy sách phù hợp.
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
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="line-clamp-1 cursor-pointer text-sm font-bold text-on-surface transition-colors group-hover:text-primary">
                          {book.title}
                        </p>
                        <p className="mt-0.5 text-xs text-outline">Tac gia: {book.author}</p>
                        <p className="mt-1 inline-block rounded bg-primary/5 px-2 py-0.5 font-mono text-[10px] text-primary">
                          ISBN: {book.isbn}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md border border-surface-container bg-surface-container-high px-2 py-1 text-[10px] font-bold uppercase text-on-surface-variant">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">{book.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${book.statusColor}`} />
                        <span className="text-xs font-bold text-slate-700">{book.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 transition-opacity hover:opacity-100">
                        <button
                          onClick={() => openEditModal(book)}
                          className="rounded-lg p-2 text-primary transition-all hover:bg-primary-container"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
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
            Hiển thị {startItem} - {endItem} trong tổng số {filteredBooks.length} sách
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-container transition-all hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
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
                {modalMode === 'add' ? 'Thêm đầu sách mới' : 'Chỉnh sửa thông tin sách'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="book-title" className="mb-1 block text-xs font-bold text-slate-600">
                    Tên sách <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="book-title"
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
                  <label htmlFor="book-isbn" className="mb-1 block text-xs font-bold text-slate-600">
                    ISBN
                  </label>
                  <input
                    id="book-isbn"
                    type="text"
                    value={formData.isbn}
                    onChange={(event) =>
                      setFormData({ ...formData, isbn: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="book-category" className="mb-1 block text-xs font-bold text-slate-600">
                    Phân loại <span className="text-red-500">*</span>
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
                <div className="col-span-1">
                  <label htmlFor="book-location" className="mb-1 block text-xs font-bold text-slate-600">
                    Vị trí kệ
                  </label>
                  <input
                    id="book-location"
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
                <div className="col-span-2">
                  <label htmlFor="book-cover" className="mb-1 block text-xs font-bold text-slate-600">
                    URL ảnh bìa
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
              </div>
              <div className="mt-4 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl bg-slate-100 px-5 py-2.5 font-bold text-slate-600 transition-colors hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2.5 font-bold text-white shadow-md shadow-primary/20 transition-opacity hover:opacity-90"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
