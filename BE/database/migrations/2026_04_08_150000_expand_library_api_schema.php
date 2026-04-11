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
            $table->index('is_digital');
            $table->index('file_format');
            $table->index('download_count');
        });

        Schema::table('borrowing', function (Blueprint $table) {
            $table->date('due_date')->nullable()->after('borrow_date');
            $table->index(['status', 'member_id']);
            $table->index(['status', 'book_id']);
            $table->index('borrow_date');
        });
    }

    public function down(): void
    {
        Schema::table('borrowing', function (Blueprint $table) {
            $table->dropIndex(['status', 'member_id']);
            $table->dropIndex(['status', 'book_id']);
            $table->dropIndex(['borrow_date']);
            $table->dropColumn('due_date');
        });

        Schema::table('books', function (Blueprint $table) {
            $table->dropIndex(['genre']);
            $table->dropIndex(['is_available']);
            $table->dropIndex(['is_digital']);
            $table->dropIndex(['file_format']);
            $table->dropIndex(['download_count']);
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
