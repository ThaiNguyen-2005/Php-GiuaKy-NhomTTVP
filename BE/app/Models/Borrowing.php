<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Borrowing extends Model
{
    use HasFactory;

    protected $table = 'borrowing';

    protected $primaryKey = 'loan_id';

    public $timestamps = false;

    protected $fillable = [
        'book_id',
        'member_id',
        'librarian_id',
        'status',
        'borrow_date',
        'due_date',
        'return_date',
    ];

    protected function casts(): array
    {
        return [
            'borrow_date' => 'date',
            'due_date' => 'date',
            'return_date' => 'date',
        ];
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class, 'book_id', 'book_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'member_id', 'member_id');
    }

    public function librarian(): BelongsTo
    {
        return $this->belongsTo(Librarian::class, 'librarian_id', 'librarian_id');
    }
}
