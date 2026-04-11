import { apiRequest } from './client';
import type { BorrowRequestListItem, MemberBorrowRequest } from '../types/request';

export type { BorrowRequestListItem as BorrowRequest, MemberBorrowRequest as MemberRequest } from '../types/request';

type PaginatedResponse<T> = {
  data: T[];
};

type BorrowingResource = {
  loan_id: number;
  book_id: number;
  member_id: number;
  librarian_id?: number | null;
  status: string;
  borrow_date?: string | null;
  due_date?: string | null;
  return_date?: string | null;
  book?: {
    book_id: number;
    title: string;
    author: string;
    genre?: string | null;
    cover?: string | null;
  } | null;
  member?: {
    member_id: number;
    name: string;
    email?: string | null;
  } | null;
};

function unwrapCollection<T>(payload: T[] | PaginatedResponse<T>) {
  return Array.isArray(payload) ? payload : payload.data;
}

function toStatusLabel(status: string) {
  if (status === 'pending') return 'Chờ duyệt';
  if (status === 'borrowed') return 'Đang mượn';
  if (status === 'returned') return 'Đã trả';
  if (status === 'rejected') return 'Từ chối';
  return status;
}

function toRoleColor() {
  return 'bg-primary-container text-primary';
}

function mapBorrowingToAdminItem(item: BorrowingResource): BorrowRequestListItem {
  return {
    id: item.loan_id,
    name: item.member?.name || 'Không rõ',
    role: 'SV',
    roleColor: toRoleColor(),
    code: String(item.member?.member_id ?? item.member_id),
    book: item.book?.title || 'Không rõ',
    bookCode: String(item.book?.book_id ?? item.book_id),
    status: toStatusLabel(item.status),
    date: item.return_date || item.due_date || item.borrow_date || '',
    requested_at: item.borrow_date || undefined,
    due_date: item.due_date || null,
    return_date: item.return_date || null,
    raw_status: item.status as BorrowRequestListItem['raw_status'],
  };
}

function mapBorrowingToMemberItem(item: BorrowingResource): MemberBorrowRequest {
  return {
    id: item.loan_id,
    bookTitle: item.book?.title || 'Không rõ',
    author: item.book?.author || 'Không rõ',
    cover: item.book?.cover || null,
    category: item.book?.genre || null,
    status: item.status as MemberBorrowRequest['status'],
    borrow_date: item.borrow_date || undefined,
    due_date: item.due_date || null,
    return_date: item.return_date || null,
  };
}

export async function requestBorrow(bookId: number) {
  return apiRequest<{ message: string; loan: BorrowingResource }>('/requests', {
    method: 'POST',
    body: { book_id: bookId },
  });
}

export async function getMyRequests() {
  const data = await apiRequest<PaginatedResponse<BorrowingResource> | BorrowingResource[]>(
    '/requests/me?limit=1000',
  );

  return unwrapCollection(data).map(mapBorrowingToMemberItem);
}

export async function getAllRequests() {
  const data = await apiRequest<PaginatedResponse<BorrowingResource> | BorrowingResource[]>(
    '/requests?limit=1000',
  );

  return unwrapCollection(data).map(mapBorrowingToAdminItem);
}

export async function approveBorrow(loanId: number) {
  return apiRequest<{ message: string; loan: BorrowingResource }>(
    `/requests/${loanId}/approve`,
    {
      method: 'POST',
    },
  );
}

export async function returnBook(loanId: number) {
  return apiRequest<{ message: string; loan: BorrowingResource }>(
    `/requests/${loanId}/return`,
    {
      method: 'POST',
    },
  );
}
