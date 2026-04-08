<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BorrowController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/books', [BookController::class, 'index']);
Route::get('/digital-documents', [BookController::class, 'getDigitalDocuments']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('role:student')->group(function () {
        Route::post('/requests', [BorrowController::class, 'requestBorrow']);
        Route::get('/requests/me', [BorrowController::class, 'getMemberRequests']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::get('/members', [AuthController::class, 'getAllMembers']);
        Route::post('/books', [BookController::class, 'store']);
        Route::put('/books/{book}', [BookController::class, 'update']);
        Route::delete('/books/{book}', [BookController::class, 'destroy']);
        Route::get('/requests', [BorrowController::class, 'getAllRequests']);
        Route::post('/requests/{loanId}/approve', [BorrowController::class, 'approveBorrow']);
        Route::post('/requests/{loanId}/return', [BorrowController::class, 'returnBook']);
    });
});
