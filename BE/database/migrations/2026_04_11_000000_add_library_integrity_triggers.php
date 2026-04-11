<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            return;
        }

        DB::unprepared(<<<'SQL'
CREATE TRIGGER IF NOT EXISTS books_quantity_guard_insert
BEFORE INSERT ON books
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN NEW.total_quantity < 0 THEN RAISE(ABORT, 'total_quantity must be non-negative.')
        WHEN NEW.available_quantity < 0 THEN RAISE(ABORT, 'available_quantity must be non-negative.')
        WHEN NEW.available_quantity > NEW.total_quantity THEN RAISE(ABORT, 'available_quantity cannot exceed total_quantity.')
    END;
END;
SQL);

        DB::unprepared(<<<'SQL'
CREATE TRIGGER IF NOT EXISTS books_quantity_guard_update
BEFORE UPDATE ON books
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN NEW.total_quantity < 0 THEN RAISE(ABORT, 'total_quantity must be non-negative.')
        WHEN NEW.available_quantity < 0 THEN RAISE(ABORT, 'available_quantity must be non-negative.')
        WHEN NEW.available_quantity > NEW.total_quantity THEN RAISE(ABORT, 'available_quantity cannot exceed total_quantity.')
    END;
END;
SQL);

        DB::unprepared(<<<'SQL'
CREATE TRIGGER IF NOT EXISTS borrowing_guard_insert
BEFORE INSERT ON borrowing
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN NEW.book_id IS NULL THEN RAISE(ABORT, 'book_id is required.')
        WHEN NEW.member_id IS NULL THEN RAISE(ABORT, 'member_id is required.')
        WHEN NEW.status IS NULL THEN RAISE(ABORT, 'status is required.')
        WHEN NEW.borrow_date IS NULL THEN RAISE(ABORT, 'borrow_date is required.')
        WHEN NEW.status NOT IN ('pending', 'borrowed', 'returned', 'rejected') THEN RAISE(ABORT, 'Invalid borrowing status.')
    END;
END;
SQL);

        DB::unprepared(<<<'SQL'
CREATE TRIGGER IF NOT EXISTS borrowing_guard_update
BEFORE UPDATE ON borrowing
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN NEW.book_id IS NULL THEN RAISE(ABORT, 'book_id is required.')
        WHEN NEW.member_id IS NULL THEN RAISE(ABORT, 'member_id is required.')
        WHEN NEW.status IS NULL THEN RAISE(ABORT, 'status is required.')
        WHEN NEW.borrow_date IS NULL THEN RAISE(ABORT, 'borrow_date is required.')
        WHEN NEW.status NOT IN ('pending', 'borrowed', 'returned', 'rejected') THEN RAISE(ABORT, 'Invalid borrowing status.')
    END;
END;
SQL);
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS books_quantity_guard_insert;');
        DB::unprepared('DROP TRIGGER IF EXISTS books_quantity_guard_update;');
        DB::unprepared('DROP TRIGGER IF EXISTS borrowing_guard_insert;');
        DB::unprepared('DROP TRIGGER IF EXISTS borrowing_guard_update;');
    }
};
