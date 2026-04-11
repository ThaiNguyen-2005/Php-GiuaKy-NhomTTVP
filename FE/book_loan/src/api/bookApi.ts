import { apiRequest } from './client';
import type {
  BookApiRecord,
  DigitalDocument as DigitalDocumentType,
  FormattedBook,
} from '../types/book';

export type { DigitalDocument } from '../types/book';

type PaginatedResponse<T> = {
  data: T[];
};

type BookPayload = {
  title: string;
  author: string;
  category?: string;
  genre?: string;
  published_year?: number;
  location?: string;
  cover?: string;
  quantity?: number;
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
    cover:
      book.cover ||
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    quantity: totalQuantity || 0,
    available_quantity: availableQuantity,
    published_year: book.published_year || undefined,
    is_available: isAvailable,
  };
}

export async function fetchBooks() {
  const data = await apiRequest<BookApiRecord[] | PaginatedResponse<BookApiRecord>>('/books?limit=1000');
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
      cover: book.cover,
      downloads: Number(book.download_count ?? 0),
    } satisfies DigitalDocumentType;
  });
}
