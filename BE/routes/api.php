<?php

use App\Http\Controllers\AdminMemberController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BorrowController;
use App\Http\Controllers\LibrarySettingController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});
Route::get('/books', [BookController::class, 'index']);
Route::get('/digital-documents', [BookController::class, 'getDigitalDocuments']);
Route::get('/digital-documents/{book}/download', [BookController::class, 'downloadDigitalDocument'])
    ->middleware('signed')
    ->name('digital-documents.download');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('role:student')->group(function () {
        Route::post('/requests', [BorrowController::class, 'requestBorrow']);
        Route::get('/requests/me', [BorrowController::class, 'getMemberRequests']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::get('/library-settings', [LibrarySettingController::class, 'show']);
        Route::put('/library-settings', [LibrarySettingController::class, 'update']);
        Route::get('/members', [AdminMemberController::class, 'index']);
        Route::post('/members', [AdminMemberController::class, 'store']);
        Route::put('/members/{member}', [AdminMemberController::class, 'update']);
        Route::delete('/members/{member}', [AdminMemberController::class, 'destroy']);
        Route::post('/books', [BookController::class, 'store']);
        Route::put('/books/{book}', [BookController::class, 'update']);
        Route::post('/books/{book}/digital-file', [BookController::class, 'uploadDigitalFile']);
        Route::delete('/books/{book}', [BookController::class, 'destroy']);
        Route::get('/requests', [BorrowController::class, 'getAllRequests']);
        Route::post('/requests/{loanId}/approve', [BorrowController::class, 'approveBorrow']);
        Route::post('/requests/{loanId}/reject', [BorrowController::class, 'rejectBorrow']);
        Route::post('/requests/{loanId}/return', [BorrowController::class, 'returnBook']);
    });
});
