<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BorrowController extends Controller
{
    public function requestBorrow(Request $request)
    {
        $request->validate([
            'member_id' => 'required|integer|exists:members,member_id',
            'book_id' => 'required|integer|exists:books,book_id',
        ]);

        $book = DB::table('books')->where('book_id', $request->book_id)->first();
        if ($book->available_quantity <= 0) {
            return response()->json(['message' => 'Sách hiện không có sẵn để mượn (đã hết)'], 400);
        }

        $loanId = DB::table('borrowing')->insertGetId([
            'member_id' => $request->member_id,
            'book_id' => $request->book_id,
            'status' => 'pending',
            'borrow_date' => now()->toDateString(),
        ]);

        return response()->json([
            'message' => 'Yêu cầu mượn sách đã được gửi',
            'loan' => DB::table('borrowing')->where('loan_id', $loanId)->first()
        ], 201);
    }

    public function approveBorrow(Request $request, $loanId)
    {
        $request->validate([
            'librarian_id' => 'required|integer|exists:librarians,librarian_id',
        ]);

        $loan = DB::table('borrowing')->where('loan_id', $loanId)->first();
        if (!$loan) {
            return response()->json(['message' => 'Không tìm thấy yêu cầu mượn'], 404);
        }

        if ($loan->status !== 'pending') {
            return response()->json(['message' => 'Yêu cầu mượn sách này đã được xử lý'], 400);
        }

        DB::table('borrowing')->where('loan_id', $loanId)->update([
            'status' => 'borrowed',
            'librarian_id' => $request->librarian_id,
            'borrow_date' => now()->toDateString(),
        ]);

        DB::table('books')->where('book_id', $loan->book_id)->decrement('available_quantity', 1);
        DB::table('books')->where('book_id', $loan->book_id)
            ->where('available_quantity', '<=', 0)
            ->update(['is_available' => false]);

        return response()->json([
            'message' => 'Đã duyệt yêu cầu mượn sách',
            'loan' => DB::table('borrowing')->where('loan_id', $loanId)->first()
        ]);
    }

    public function returnBook(Request $request, $loanId)
    {
        $request->validate([
            'librarian_id' => 'required|integer|exists:librarians,librarian_id',
        ]);

        $loan = DB::table('borrowing')->where('loan_id', $loanId)->first();
        if (!$loan) {
            return response()->json(['message' => 'Không tìm thấy yêu cầu mượn'], 404);
        }

        if ($loan->status !== 'borrowed') {
            return response()->json(['message' => 'Yêu cầu mượn sách này chưa được duyệt hoặc đã trả'], 400);
        }

        DB::table('borrowing')->where('loan_id', $loanId)->update([
            'status' => 'returned',
            'return_date' => now()->toDateString(),
        ]);

        DB::table('books')->where('book_id', $loan->book_id)->increment('available_quantity', 1);
        DB::table('books')->where('book_id', $loan->book_id)->update(['is_available' => true]);

        return response()->json([
            'message' => 'Đã xử lý trả sách',
            'loan' => DB::table('borrowing')->where('loan_id', $loanId)->first()
        ]);
    }

    public function getAllRequests(Request $request)
    {
        $requests = DB::table('borrowing')
            ->join('members', 'borrowing.member_id', '=', 'members.member_id')
            ->join('books', 'borrowing.book_id', '=', 'books.book_id')
            ->select(
                'borrowing.loan_id as id',
                'members.name as name',
                'members.member_id as code',
                'books.title as book',
                'books.book_id as bookCode',
                'borrowing.status',
                DB::raw('COALESCE(borrowing.return_date, borrowing.borrow_date) as date')
            )
            ->orderBy('borrowing.loan_id', 'desc')
            ->get();

        // Map status to Vietnamese UI status if needed or handle in FE.
        $mappedRequests = $requests->map(function ($req) {
            $statusText = 'Chờ duyệt';
            if ($req->status === 'borrowed') $statusText = 'Đang mượn';
            if ($req->status === 'returned') $statusText = 'Đã trả';
            if ($req->status === 'rejected') $statusText = 'Từ chối';
            // Simple logic for overdue (Quá hạn) could be added here if needed.

            return [
                'id' => $req->id,
                'name' => $req->name,
                'role' => 'SV',
                'roleColor' => 'bg-primary-container text-primary',
                'code' => $req->code,
                'book' => $req->book,
                'bookCode' => $req->bookCode,
                'status' => $statusText,
                'date' => $req->date,
                'raw_status' => $req->status
            ];
        });

        return response()->json($mappedRequests);
    }

    public function getMemberRequests(Request $request, $memberId)
    {
        $requests = DB::table('borrowing')
            ->join('books', 'borrowing.book_id', '=', 'books.book_id')
            ->where('borrowing.member_id', $memberId)
            ->select(
                'borrowing.loan_id as id',
                'books.title as bookTitle',
                'books.author',
                'books.cover',
                'books.genre as category',
                'borrowing.status',
                'borrowing.borrow_date',
                'borrowing.return_date'
            )
            ->orderBy('borrowing.loan_id', 'desc')
            ->get();

        return response()->json($requests);
    }
}
