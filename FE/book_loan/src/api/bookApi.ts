import { apiRequest } from './client';

type RawBook = {
  book_id: number;
  title: string;
  author: string;
  genre?: string | null;
  published_year?: number | null;
  is_available?: boolean | number;
  cover?: string | null;
  location?: string | null;
  total_quantity?: number | null;
  available_quantity?: number | null;
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
  return isAvailable ? 'San co' : 'Het sach';
}

function normalizeBook(book: RawBook) {
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
  const data = await apiRequest<RawBook[]>('/books');
  return data.map(normalizeBook);
}

export async function searchBooks(query: string) {
  const params = new URLSearchParams({ query });
  const data = await apiRequest<RawBook[]>(`/books/search?${params.toString()}`);
  return data.map(normalizeBook);
}

export async function addBook(payload: BookPayload) {
  const response = await apiRequest<{ book: RawBook }>('/admin/books', {
    method: 'POST',
    body: {
      title: payload.title,
      author: payload.author,
      genre: payload.category || payload.genre,
      published_year: payload.published_year,
      cover: payload.cover,
      location: payload.location,
      quantity: payload.quantity ?? 1,
    },
  });

  return normalizeBook(response.book);
}

export async function updateBook(bookId: number, payload: BookPayload) {
  const response = await apiRequest<{ book: RawBook }>(`/admin/books/${bookId}`, {
    method: 'PUT',
    body: {
      title: payload.title,
      author: payload.author,
      genre: payload.category || payload.genre,
      published_year: payload.published_year,
      cover: payload.cover,
      location: payload.location,
      quantity: payload.quantity,
    },
  });

  return normalizeBook(response.book);
}

export async function deleteBook(bookId: number) {
  return apiRequest<{ message: string }>(`/admin/books/${bookId}`, {
    method: 'DELETE',
  });
}
