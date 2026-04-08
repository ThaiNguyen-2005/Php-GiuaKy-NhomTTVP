<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    use HasFactory;

    protected $table = 'books';

    protected $primaryKey = 'book_id';

    public $timestamps = false;

    protected $fillable = [
        'title',
        'author',
        'genre',
        'published_year',
        'is_available',
        'cover',
        'location',
        'is_digital',
        'resource_type',
        'file_format',
        'file_size',
        'download_count',
        'total_quantity',
        'available_quantity',
    ];

    protected function casts(): array
    {
        return [
            'is_available' => 'boolean',
            'is_digital' => 'boolean',
            'published_year' => 'integer',
            'download_count' => 'integer',
            'total_quantity' => 'integer',
            'available_quantity' => 'integer',
        ];
    }

    public function borrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class, 'book_id', 'book_id');
    }
}
