import { apiRequest } from './client';
import type {
  BookApiRecord,
  DigitalDocument as DigitalDocumentType,
  FormattedBook,
} from '../types/book';
import { getCoverUrl } from '../lib/display';

export type { DigitalDocument } from '../types/book';

type PaginatedResponse<T> = {
  data: T[];
};

export type BookPayload = {
  title: string;
  author: string;
  category?: string;
  genre?: string;
  published_year?: number;
  location?: string;
  cover?: string;
  quantity?: number;
  is_digital?: boolean;
  resource_type?: string;
  file_format?: string;
  file_size?: string;
  file_path?: string;
  file_url?: string;
};

function toStatusColor(isAvailable: boolean) {
  return isAvailable ? 'bg-green-500' : 'bg-tertiary';
}

function toStatus(isAvailable: boolean) {
  return isAvailable ? 'Sẵn có' : 'Hết sách';
}

function unwrapCollection<T>(payload: T[] | PaginatedResponse<T>) {
  return Array.isArray(payload) ? payload : payload.data;
}

function normalizeBook(book: BookApiRecord): FormattedBook {
  const availableQuantity = Number(book.available_quantity ?? 0);
  const totalQuantity = Number(book.total_quantity ?? 0);
  const isAvailable = Boolean(book.is_available) && availableQuantity > 0;

  return {
    id: book.book_id,
    book_id: book.book_id,
    title: book.title,
    author: book.author,
    isbn: `ISBN-${book.book_id}000`,
    category: book.genre || 'Khac',
    genre: book.genre || 'Khac',
    location: book.location || 'Khu A',
    status: toStatus(isAvailable),
    statusColor: toStatusColor(isAvailable),
    cover: getCoverUrl(book.cover),
    quantity: totalQuantity || 0,
    available_quantity: availableQuantity,
    published_year: book.published_year || undefined,
    is_available: isAvailable,
    is_digital: Boolean(book.is_digital),
    resource_type: book.resource_type || null,
    file_format: book.file_format || null,
    file_size: book.file_size || null,
    has_digital_file: Boolean(book.has_digital_file),
    digital_file_name: book.digital_file_name || null,
    download_count: Number(book.download_count ?? 0),
  };
}

export async function fetchBooks() {
  const data = await apiRequest<BookApiRecord[] | PaginatedResponse<BookApiRecord>>('/books?limit=1000');
  return unwrapCollection(data).map(normalizeBook);
}

export async function fetchBorrowableBooks() {
  const data = await apiRequest<BookApiRecord[] | PaginatedResponse<BookApiRecord>>(
    '/books?is_digital=false&limit=1000'
  );
  return unwrapCollection(data).map(normalizeBook);
}

export async function fetchDigitalResourceBooks() {
  const data = await apiRequest<BookApiRecord[] | PaginatedResponse<BookApiRecord>>(
    '/books?is_digital=true&limit=1000'
  );
  return unwrapCollection(data).map(normalizeBook);
}

export async function searchBooks(query: string) {
  const data = await apiRequest<BookApiRecord[] | PaginatedResponse<BookApiRecord>>(
    `/books?query=${encodeURIComponent(query)}&limit=1000`
  );
  return unwrapCollection(data).map(normalizeBook);
}

export async function addBook(payload: BookPayload) {
  const book = await apiRequest<BookApiRecord>('/books', {
    method: 'POST',
    body: {
      ...payload,
      genre: payload.genre || payload.category,
    },
  });

  return normalizeBook(book);
}

export async function addBorrowableBook(payload: BookPayload) {
  return addBook({
    ...payload,
    is_digital: false,
    resource_type: undefined,
    file_format: undefined,
    file_size: undefined,
    file_path: undefined,
    file_url: undefined,
  });
}

export async function addDigitalResource(payload: BookPayload) {
  return addBook({
    ...payload,
    is_digital: true,
    quantity: 0,
    location: payload.location || undefined,
    file_url: undefined,
  });
}

export async function updateBook(bookId: number, payload: BookPayload) {
  const book = await apiRequest<BookApiRecord>(`/books/${bookId}`, {
    method: 'PUT',
    body: {
      ...payload,
      genre: payload.genre || payload.category,
    },
  });

  return normalizeBook(book);
}

export async function updateBorrowableBook(bookId: number, payload: BookPayload) {
  return updateBook(bookId, {
    ...payload,
    is_digital: false,
    resource_type: undefined,
    file_format: undefined,
    file_size: undefined,
    file_path: undefined,
    file_url: undefined,
  });
}

export async function updateDigitalResource(bookId: number, payload: BookPayload) {
  return updateBook(bookId, {
    ...payload,
    is_digital: true,
    location: payload.location || undefined,
    file_url: undefined,
  });
}

export async function uploadDigitalFile(bookId: number, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const book = await apiRequest<BookApiRecord>(`/books/${bookId}/digital-file`, {
    method: 'POST',
    body: formData,
  });

  return normalizeBook(book);
}

export async function deleteBook(bookId: number) {
  return apiRequest<{ message: string }>(`/books/${bookId}`, {
    method: 'DELETE',
  });
}

export async function fetchDigitalDocuments() {
  const data = await apiRequest<BookApiRecord[] | PaginatedResponse<BookApiRecord>>(
    '/digital-documents'
  );

  return unwrapCollection(data).map((book) => {
    const format = (book.file_format || 'PDF').toUpperCase();

    return {
      id: book.book_id,
      title: book.title,
      author: book.author,
      type: book.resource_type || book.genre || 'Tài liệu',
      format,
      size: book.file_size || 'N/A',
      color:
        format === 'PDF'
          ? 'bg-red-500'
          : format === 'EPUB'
            ? 'bg-blue-500'
            : format === 'AUDIO'
              ? 'bg-purple-500'
              : format === 'SLIDES'
                ? 'bg-orange-500'
                : 'bg-primary',
      cover: getCoverUrl(book.cover),
      downloads: Number(book.download_count ?? 0),
      openUrl: book.open_url || null,
      downloadUrl: book.download_url || book.open_url || null,
      hasAttachedFile: Boolean(book.has_attached_file),
    } satisfies DigitalDocumentType;
  });
}
