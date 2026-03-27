<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login']);

Route::get('/books', function() {
    return response()->json(\Illuminate\Support\Facades\DB::table('books')->get());
});
