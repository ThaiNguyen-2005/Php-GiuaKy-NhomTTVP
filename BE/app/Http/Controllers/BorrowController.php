<?php

namespace App\Http\Controllers;

use App\Http\Requests\BorrowStoreRequest;
use App\Http\Requests\BorrowingIndexRequest;
use App\Http\Resources\BorrowingResource;
use App\Models\Book;
use App\Models\Borrowing;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BorrowController extends Controller
{
    public function requestBorrow(BorrowStoreRequest $request)
    {
        $member = $request->user();
        $validated = $request->validated();

        $loan = DB::transaction(function () use ($member, $validated) {
            $book = Book::query()->lockForUpdate()->findOrFail($validated['book_id']);

            if ($book->available_quantity <= 0) {
                throw new HttpResponseException(response()->json(['message' => 'Sach hien khong co san de muon.'], 422));
            }

            $activeLoanCount = Borrowing::query()
                ->where('member_id', $member->member_id)
                ->whereIn('status', ['pending', 'borrowed'])
                ->lockForUpdate()
                ->count();

            if ($activeLoanCount >= 5) {
                throw new HttpResponseException(response()->json(['message' => 'Ban da dat gioi han 5 yeu cau dang hoat dong.'], 422));
            }

            $duplicateLoan = Borrowing::query()
                ->where('member_id', $member->member_id)
                ->where('book_id', $book->book_id)
                ->whereIn('status', ['pending', 'borrowed'])
                ->lockForUpdate()
                ->exists();

            if ($duplicateLoan) {
                throw new HttpResponseException(response()->json(['message' => 'Ban da co mot yeu cau hoac phieu muon cho cuon sach nay.'], 422));
            }

            return Borrowing::query()->create([
                'member_id' => $member->member_id,
                'book_id' => $book->book_id,
                'status' => 'pending',
                'borrow_date' => now()->toDateString(),
            ]);
        });

        return response()->json([
            'message' => 'Yeu cau muon sach da duoc gui.',
            'loan' => BorrowingResource::make($loan->fresh(['book', 'member', 'librarian'])),
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

            $book->available_quantity = $book->available_quantity - 1;
            $book->is_available = $book->available_quantity > 0;
            $book->save();

            return $loan->fresh(['book', 'member', 'librarian']);
        });

        return response()->json([
            'message' => 'Da duyet yeu cau muon sach.',
            'loan' => BorrowingResource::make($loan),
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

            return $loan->fresh(['book', 'member', 'librarian']);
        });

        return response()->json([
            'message' => 'Da xu ly tra sach.',
            'loan' => BorrowingResource::make($loan),
        ]);
    }

    public function getAllRequests(BorrowingIndexRequest $request)
    {
        $validated = $request->validated();
        $requests = $this->buildBorrowingQuery($validated)
            ->paginate($validated['limit'] ?? 15, ['*'], 'page', $validated['page'] ?? 1)
            ->withQueryString();

        return BorrowingResource::collection($requests);
    }

    public function getMemberRequests(BorrowingIndexRequest $request)
    {
        $validated = $request->validated();
        $requests = $this->buildBorrowingQuery($validated, $request->user()->member_id)
            ->paginate($validated['limit'] ?? 15, ['*'], 'page', $validated['page'] ?? 1)
            ->withQueryString();

        return BorrowingResource::collection($requests);
    }

    private function buildBorrowingQuery(array $filters, ?int $memberId = null): Builder
    {
        $query = Borrowing::query()
            ->with(['member', 'book', 'librarian'])
            ->orderByDesc('loan_id');

        if ($memberId !== null) {
            $query->where('member_id', $memberId);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['member_id'])) {
            $query->where('member_id', $filters['member_id']);
        }

        if (! empty($filters['book_id'])) {
            $query->where('book_id', $filters['book_id']);
        }

        $search = trim((string) ($filters['query'] ?? ''));

        if ($search !== '') {
            $query->where(function (Builder $builder) use ($search) {
                $builder
                    ->whereHas('member', function (Builder $memberQuery) use ($search) {
                        $memberQuery
                            ->where('name', 'like', '%'.$search.'%')
                            ->orWhere('email', 'like', '%'.$search.'%');
                    })
                    ->orWhereHas('book', function (Builder $bookQuery) use ($search) {
                        $bookQuery
                            ->where('title', 'like', '%'.$search.'%')
                            ->orWhere('author', 'like', '%'.$search.'%');
                    })
                    ->orWhere('status', 'like', '%'.$search.'%');
            });
        }

        return $query;
    }
}
