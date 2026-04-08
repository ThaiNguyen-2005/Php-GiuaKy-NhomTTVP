<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Borrowing;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;

class BorrowController extends Controller
{
    public function requestBorrow(Request $request)
    {
        $request->validate([
            'book_id' => 'required|integer|exists:books,book_id',
        ]);

        $member = $request->user();
        $book = Book::query()->findOrFail($request->integer('book_id'));

        if ($book->available_quantity <= 0) {
            return response()->json(['message' => 'Sach hien khong co san de muon.'], 422);
        }

        $activeLoanCount = Borrowing::query()
            ->where('member_id', $member->member_id)
            ->whereIn('status', ['pending', 'borrowed'])
            ->count();

        if ($activeLoanCount >= 5) {
            return response()->json(['message' => 'Ban da dat gioi han 5 yeu cau dang hoat dong.'], 422);
        }

        $duplicateLoan = Borrowing::query()
            ->where('member_id', $member->member_id)
            ->where('book_id', $book->book_id)
            ->whereIn('status', ['pending', 'borrowed'])
            ->exists();

        if ($duplicateLoan) {
            return response()->json(['message' => 'Ban da co mot yeu cau hoac phieu muon cho cuon sach nay.'], 422);
        }

        $loan = Borrowing::query()->create([
            'member_id' => $member->member_id,
            'book_id' => $book->book_id,
            'status' => 'pending',
            'borrow_date' => now()->toDateString(),
        ]);

        return response()->json([
            'message' => 'Yeu cau muon sach da duoc gui.',
            'loan' => $loan,
        ], 201);
    }

    public function approveBorrow(Request $request, int $loanId)
    {
        $librarian = $request->user();

        $loan = DB::transaction(function () use ($loanId, $librarian) {
            $loan = Borrowing::query()->lockForUpdate()->find($loanId);

            if (! $loan) {
                throw new HttpResponseException(response()->json(['message' => 'Khong tim thay yeu cau muon.'], 404));
            }

            if ($loan->status !== 'pending') {
                throw new HttpResponseException(response()->json(['message' => 'Yeu cau nay da duoc xu ly.'], 422));
            }

            $book = Book::query()->lockForUpdate()->find($loan->book_id);

            if (! $book || $book->available_quantity <= 0) {
                throw new HttpResponseException(response()->json(['message' => 'Sach hien khong con ban sao kha dung.'], 422));
            }

            $loan->status = 'borrowed';
            $loan->librarian_id = $librarian->librarian_id;
            $loan->due_date = now()->addDays(14)->toDateString();
            $loan->save();

            $book->available_quantity = max(0, $book->available_quantity - 1);
            $book->is_available = $book->available_quantity > 0;
            $book->save();

            return $loan->fresh(['book', 'member']);
        });

        return response()->json([
            'message' => 'Da duyet yeu cau muon sach.',
            'loan' => $loan,
        ]);
    }

    public function returnBook(Request $request, int $loanId)
    {
        $loan = DB::transaction(function () use ($loanId) {
            $loan = Borrowing::query()->lockForUpdate()->find($loanId);

            if (! $loan) {
                throw new HttpResponseException(response()->json(['message' => 'Khong tim thay phieu muon.'], 404));
            }

            if ($loan->status !== 'borrowed') {
                throw new HttpResponseException(response()->json(['message' => 'Chi co the tra sach dang o trang thai borrowed.'], 422));
            }

            $book = Book::query()->lockForUpdate()->find($loan->book_id);

            $loan->status = 'returned';
            $loan->return_date = now()->toDateString();
            $loan->save();

            if ($book) {
                $book->available_quantity += 1;
                $book->is_available = true;
                $book->save();
            }

            return $loan->fresh(['book', 'member']);
        });

        return response()->json([
            'message' => 'Da xu ly tra sach.',
            'loan' => $loan,
        ]);
    }

    public function getAllRequests()
    {
        $requests = Borrowing::query()
            ->with(['member', 'book'])
            ->latest('loan_id')
            ->get();

        $mappedRequests = $requests->map(function (Borrowing $request) {
            return [
                'id' => $request->loan_id,
                'name' => $request->member?->name ?? 'Khong ro',
                'role' => 'SV',
                'roleColor' => 'bg-primary-container text-primary',
                'code' => $request->member?->member_id,
                'book' => $request->book?->title ?? 'Khong ro',
                'bookCode' => $request->book?->book_id,
                'status' => $this->mapStatusLabel($request->status),
                'date' => $request->return_date?->toDateString()
                    ?? $request->due_date?->toDateString()
                    ?? $request->borrow_date?->toDateString(),
                'requested_at' => $request->borrow_date?->toDateString(),
                'due_date' => $request->due_date?->toDateString(),
                'return_date' => $request->return_date?->toDateString(),
                'raw_status' => $request->status,
            ];
        });

        return response()->json($mappedRequests);
    }

    public function getMemberRequests(Request $request)
    {
        $requests = Borrowing::query()
            ->with('book')
            ->where('member_id', $request->user()->member_id)
            ->latest('loan_id')
            ->get();

        return response()->json(
            $requests->map(function (Borrowing $request) {
                return [
                    'id' => $request->loan_id,
                    'bookTitle' => $request->book?->title ?? 'Khong ro',
                    'author' => $request->book?->author ?? 'Khong ro',
                    'cover' => $request->book?->cover,
                    'category' => $request->book?->genre,
                    'status' => $request->status,
                    'borrow_date' => $request->borrow_date?->toDateString(),
                    'due_date' => $request->due_date?->toDateString(),
                    'return_date' => $request->return_date?->toDateString(),
                ];
            })
        );
    }

    private function mapStatusLabel(string $status): string
    {
        return match ($status) {
            'pending' => 'Cho duyet',
            'borrowed' => 'Dang muon',
            'returned' => 'Da tra',
            'rejected' => 'Tu choi',
            default => $status,
        };
    }
}
