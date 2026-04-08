import { apiRequest } from './client';

export type BorrowRequest = {
  id: number;
  name: string;
  role: string;
  roleColor: string;
  code: string;
  book: string;
  bookCode: string;
  status: string;
  date: string;
  requested_at?: string;
  due_date?: string | null;
  return_date?: string | null;
  raw_status: string;
};

export type MemberRequest = {
  id: number;
  bookTitle: string;
  author: string;
  cover?: string | null;
  category?: string | null;
  status: string;
  borrow_date?: string;
  due_date?: string | null;
  return_date?: string | null;
};

export async function requestBorrow(bookId: number) {
  return apiRequest<{ message: string; loan: unknown }>('/requests', {
    method: 'POST',
    body: { book_id: bookId },
  });
}

export async function getMyRequests() {
  return apiRequest<MemberRequest[]>('/requests/me');
}

export async function getAllRequests() {
  return apiRequest<BorrowRequest[]>('/requests');
}

export async function approveBorrow(loanId: number) {
  return apiRequest<{ message: string; loan: unknown }>(`/requests/${loanId}/approve`, {
    method: 'POST',
  });
}

export async function returnBook(loanId: number) {
  return apiRequest<{ message: string; loan: unknown }>(`/requests/${loanId}/return`, {
    method: 'POST',
  });
}
