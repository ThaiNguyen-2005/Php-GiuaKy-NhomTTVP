<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BorrowingSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('borrowing')->insert([
            [
                'loan_id' => 1,
                'book_id' => 1,
                'member_id' => 1,
                'librarian_id' => 1,
                'status' => 'borrowed',
                'borrow_date' => '2026-04-01',
                'due_date' => '2026-04-15',
                'return_date' => null,
            ],
            [
                'loan_id' => 2,
                'book_id' => 2,
                'member_id' => 2,
                'librarian_id' => null,
                'status' => 'pending',
                'borrow_date' => '2026-04-06',
                'due_date' => null,
                'return_date' => null,
            ],
            [
                'loan_id' => 3,
                'book_id' => 3,
                'member_id' => 1,
                'librarian_id' => 1,
                'status' => 'returned',
                'borrow_date' => '2026-03-10',
                'due_date' => '2026-03-24',
                'return_date' => '2026-03-20',
            ],
        ]);
    }
}
