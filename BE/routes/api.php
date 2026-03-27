<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\BookController;
use App\Http\Controllers\BorrowController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/users/{id}', [AuthController::class, 'getUser']);

Route::get('/books', function() {
    return response()->json(\Illuminate\Support\Facades\DB::table('books')->get());
});
Route::get('/books/search', [BookController::class, 'search']);

// User requests
Route::post('/borrow/request', [BorrowController::class, 'requestBorrow']);
Route::get('/borrow/member/{member_id}', [BorrowController::class, 'getMemberRequests']);

// Admin requests (book management & borrow approvals/returns)
Route::post('/admin/books', [BookController::class, 'store']);
Route::put('/admin/books/{book_id}', [BookController::class, 'update']);
Route::delete('/admin/books/{book_id}', [BookController::class, 'destroy']);

Route::get('/admin/members', [AuthController::class, 'getAllMembers']);

Route::get('/admin/borrow', [BorrowController::class, 'getAllRequests']);
Route::put('/admin/borrow/{loan_id}/approve', [BorrowController::class, 'approveBorrow']);
Route::put('/admin/borrow/{loan_id}/return', [BorrowController::class, 'returnBook']);
