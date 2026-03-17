<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \Illuminate\Support\Facades\DB::table('books')->insert([
            ['book_id' => 1, 'title' => 'The Great Gatsby', 'author' => 'F. Scott Fitzgerald', 'genre' => 'Fiction', 'published_year' => 1925, 'is_available' => 1],
            ['book_id' => 2, 'title' => '1984', 'author' => 'George Orwell', 'genre' => 'Dystopian', 'published_year' => 1949, 'is_available' => 1],
            ['book_id' => 3, 'title' => 'To Kill a Mockingbird', 'author' => 'Harper Lee', 'genre' => 'Classic', 'published_year' => 1960, 'is_available' => 1],
        ]);
    }
}
