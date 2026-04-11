<?php

namespace Tests\Feature;

use App\Models\Book;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DatabaseIntegrityTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public function test_book_quantity_constraints_are_enforced_at_database_level(): void
    {
        $this->expectException(QueryException::class);

        Book::query()->create([
            'title' => 'Invalid Quantity Book',
            'author' => 'Test Author',
            'genre' => 'Test',
            'published_year' => 2026,
            'is_available' => true,
            'cover' => null,
            'location' => null,
            'is_digital' => false,
            'resource_type' => null,
            'file_format' => null,
            'file_size' => null,
            'download_count' => 0,
            'total_quantity' => 1,
            'available_quantity' => 2,
        ]);
    }

    public function test_borrowing_foreign_keys_are_required_at_database_level(): void
    {
        $this->expectException(QueryException::class);

        DB::table('borrowing')->insert([
            'book_id' => null,
            'member_id' => 1,
            'librarian_id' => null,
            'status' => 'pending',
            'borrow_date' => now()->toDateString(),
            'due_date' => null,
            'return_date' => null,
        ]);
    }
}
