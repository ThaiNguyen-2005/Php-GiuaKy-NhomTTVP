<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \Illuminate\Support\Facades\DB::table('members')->insert([
            ['member_id' => 1, 'name' => 'Alen King', 'email' => 'alenking@example.com', 'phone_number' => '1234567890', 'join_date' => '2026-03-17'],
            ['member_id' => 2, 'name' => 'Alece Hofman', 'email' => 'alecehofman@example.com', 'phone_number' => '9876543210', 'join_date' => '2026-03-17'],
        ]);
    }
}
