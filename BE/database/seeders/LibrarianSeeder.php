<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class LibrarianSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = env('LIBRARY_DEMO_PASSWORD', 'Library@2026');

        DB::table('librarians')->insert([
            [
                'librarian_id' => 1,
                'name' => 'Nail Horn',
                'email' => 'nail@example.com',
                'password' => Hash::make($defaultPassword),
                'phone_number' => '4567891230',
                'hire_date' => '2026-03-17',
            ],
            [
                'librarian_id' => 2,
                'name' => 'Garden McGraw',
                'email' => 'garden@example.com',
                'password' => Hash::make($defaultPassword),
                'phone_number' => '7894561230',
                'hire_date' => '2026-03-17',
            ],
        ]);
    }
}
