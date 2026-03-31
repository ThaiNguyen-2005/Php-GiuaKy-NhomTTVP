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
            ['book_id' => 1, 'title' => 'Giáo trình Tâm lý học Đại cương', 'author' => 'Nhiều tác giả', 'genre' => 'Giáo trình', 'published_year' => 2022, 'is_available' => 1],
            ['book_id' => 2, 'title' => 'Lập trình Python cơ bản', 'author' => 'TS. Nguyễn Mạnh Hùng', 'genre' => 'Công nghệ thông tin', 'published_year' => 2021, 'is_available' => 0],
            ['book_id' => 3, 'title' => 'Tạp chí Giáo dục số 452', 'author' => 'Bộ Giáo dục và Đào tạo', 'genre' => 'Tạp chí', 'published_year' => 2023, 'is_available' => 1],
            ['book_id' => 4, 'title' => 'Nhập môn Trí tuệ Nhân tạo', 'author' => 'Stuart Russell', 'genre' => 'Công nghệ thông tin', 'published_year' => 2020, 'is_available' => 1],
            ['book_id' => 5, 'title' => 'Vật lý Đại cương', 'author' => 'Alonso Finn', 'genre' => 'Giáo trình', 'published_year' => 2018, 'is_available' => 1],
        ]);
    }
}
