import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Catalog from '../pages/student/Catalog';
import type { FormattedBook } from '../types/book';

const { fetchBorrowableBooksMock, fetchBooksMock } = vi.hoisted(() => ({
  fetchBorrowableBooksMock: vi.fn(),
  fetchBooksMock: vi.fn(),
}));

const borrowableBook: FormattedBook = {
  id: 7,
  book_id: 7,
  title: 'Borrowable Catalog Book',
  author: 'Library Admin',
  isbn: 'ISBN-7000',
  category: 'Reference',
  genre: 'Reference',
  location: 'Shelf C',
  status: 'San co',
  statusColor: 'bg-green-500',
  cover: 'https://example.com/cover.jpg',
  quantity: 2,
  available_quantity: 2,
  is_available: true,
  is_digital: false,
};

vi.mock('../api/bookApi', () => ({
  fetchBooks: () => fetchBooksMock(),
  fetchBorrowableBooks: () => fetchBorrowableBooksMock(),
}));

vi.mock('../api/borrowApi', () => ({
  requestBorrow: vi.fn(),
}));

describe('Catalog borrowable split', () => {
  it('loads only borrowable books for the student catalog', async () => {
    fetchBorrowableBooksMock.mockResolvedValueOnce([borrowableBook]);
    fetchBooksMock.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>,
    );

    await waitFor(() => expect(fetchBorrowableBooksMock).toHaveBeenCalled());
    expect(fetchBooksMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Borrowable Catalog Book')).toBeInTheDocument();
  });
});
