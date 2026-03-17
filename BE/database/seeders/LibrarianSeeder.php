<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LibrarianSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \Illuminate\Support\Facades\DB::table('librarians')->insert([
            ['librarian_id' => 1, 'name' => 'Nail Horn', 'email' => 'nail@example.com', 'phone_number' => '4567891230', 'hire_date' => '2026-03-17'],
            ['librarian_id' => 2, 'name' => 'Garden McGraw', 'email' => 'garden@example.com', 'phone_number' => '7894561230', 'hire_date' => '2026-03-17'],
        ]);
    }
}
