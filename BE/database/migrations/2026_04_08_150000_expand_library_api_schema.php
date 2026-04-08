<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->string('cover')->nullable()->after('is_available');
            $table->string('location', 100)->nullable()->after('cover');
            $table->boolean('is_digital')->default(false)->after('location');
            $table->string('resource_type', 50)->nullable()->after('is_digital');
            $table->string('file_format', 20)->nullable()->after('resource_type');
            $table->string('file_size', 20)->nullable()->after('file_format');
            $table->unsignedInteger('download_count')->default(0)->after('file_size');
            $table->index('genre');
            $table->index('is_available');
        });

        Schema::table('borrowing', function (Blueprint $table) {
            $table->date('due_date')->nullable()->after('borrow_date');
            $table->index('status');
            $table->index('member_id');
            $table->index('book_id');
        });

        Schema::table('members', function (Blueprint $table) {
            $table->index('email');
        });

        Schema::table('librarians', function (Blueprint $table) {
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::table('librarians', function (Blueprint $table) {
            $table->dropIndex(['email']);
        });

        Schema::table('members', function (Blueprint $table) {
            $table->dropIndex(['email']);
        });

        Schema::table('borrowing', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['member_id']);
            $table->dropIndex(['book_id']);
            $table->dropColumn('due_date');
        });

        Schema::table('books', function (Blueprint $table) {
            $table->dropIndex(['genre']);
            $table->dropIndex(['is_available']);
            $table->dropColumn([
                'cover',
                'location',
                'is_digital',
                'resource_type',
                'file_format',
                'file_size',
                'download_count',
            ]);
        });
    }
};
