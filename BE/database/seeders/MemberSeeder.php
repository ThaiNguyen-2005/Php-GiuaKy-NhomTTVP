<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = env('LIBRARY_DEMO_PASSWORD', 'Library@2026');

        DB::table('members')->insert([
            [
                'member_id' => 1,
                'name' => 'Alen King',
                'email' => 'alenking@example.com',
                'password' => Hash::make($defaultPassword),
                'phone_number' => '1234567890',
                'join_date' => '2026-03-17',
            ],
            [
                'member_id' => 2,
                'name' => 'Alece Hofman',
                'email' => 'alecehofman@example.com',
                'password' => Hash::make($defaultPassword),
                'phone_number' => '9876543210',
                'join_date' => '2026-03-17',
            ],
        ]);
    }
}
