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
        Schema::table('members', function (Blueprint $table) {
            $table->string('password')->after('email')->default(bcrypt('123456'));
        });
        
        Schema::table('librarians', function (Blueprint $table) {
            $table->string('password')->after('email')->default(bcrypt('123456'));
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn('password');
        });
        
        Schema::table('librarians', function (Blueprint $table) {
            $table->dropColumn('password');
        });
    }
};
