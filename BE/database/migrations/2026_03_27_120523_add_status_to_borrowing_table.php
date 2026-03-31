<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('borrowing', function (Blueprint $table) {
            $table->enum('status', ['pending', 'borrowed', 'returned', 'rejected'])->default('pending')->after('librarian_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('borrowing', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
