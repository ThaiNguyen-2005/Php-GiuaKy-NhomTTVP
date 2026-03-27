import { apiRequest } from './client';

type BorrowRequest = {
  id: number;
  name: string;
  role: string;
  roleColor: string;
  code: string;
  book: string;
  bookCode: string;
  status: string;
  date: string;
  raw_status: string;
};

type MemberRequest = {
  id: number;
  bookTitle: string;
  author: string;
  cover?: string;
  category?: string;
  status: string;
  borrow_date?: string;
  return_date?: string | null;
};

export async function requestBorrow(memberId: number, bookId: number) {
  return apiRequest('/borrow/request', {
    method: 'POST',
    body: {
      member_id: memberId,
      book_id: bookId,
    },
  });
}

export async function getMemberRequests(memberId: number) {
  return apiRequest<MemberRequest[]>(`/borrow/member/${memberId}`);
}

export async function getAllRequests() {
  return apiRequest<BorrowRequest[]>('/admin/borrow');
}

export async function approveBorrow(loanId: number, librarianId: number) {
  return apiRequest(`/admin/borrow/${loanId}/approve`, {
    method: 'PUT',
    body: {
      librarian_id: librarianId,
    },
  });
}

export async function returnBook(loanId: number, librarianId: number) {
  return apiRequest(`/admin/borrow/${loanId}/return`, {
    method: 'PUT',
    body: {
      librarian_id: librarianId,
    },
  });
}
