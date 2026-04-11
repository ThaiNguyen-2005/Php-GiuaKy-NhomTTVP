<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BorrowingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'loan_id' => $this->loan_id,
            'book_id' => $this->book_id,
            'member_id' => $this->member_id,
            'librarian_id' => $this->librarian_id,
            'status' => $this->status,
            'borrow_date' => $this->borrow_date?->toDateString(),
            'due_date' => $this->due_date?->toDateString(),
            'return_date' => $this->return_date?->toDateString(),
            'book' => $this->relationLoaded('book') ? BookResource::make($this->book) : null,
            'member' => $this->relationLoaded('member') ? MemberResource::make($this->member) : null,
            'librarian' => $this->relationLoaded('librarian') ? LibrarianResource::make($this->librarian) : null,
        ];
    }
}
