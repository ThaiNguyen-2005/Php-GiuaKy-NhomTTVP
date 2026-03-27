import {
  mockApproveBorrow,
  mockGetAllRequests,
  mockGetMemberRequests,
  mockRequestBorrow,
  mockReturnBook,
} from './mockData';

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
  return mockRequestBorrow(memberId, bookId);
}

export async function getMemberRequests(memberId: number) {
  return mockGetMemberRequests(memberId) as Promise<MemberRequest[]>;
}

export async function getAllRequests() {
  return mockGetAllRequests() as Promise<BorrowRequest[]>;
}

export async function approveBorrow(loanId: number, librarianId: number) {
  return mockApproveBorrow(loanId, librarianId);
}

export async function returnBook(loanId: number, librarianId: number) {
  return mockReturnBook(loanId, librarianId);
}
