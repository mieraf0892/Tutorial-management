<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\StudentAuthController;
use Illuminate\Support\Facades\Route;

// Auth
Route::post('/register/student', [StudentAuthController::class, 'register']);
Route::post('/register/tutor', [App\Http\Controllers\Auth\TutorAuthController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);
// Degree photo public route - anyone can view degree photo
Route::get('/tutors/{tutor}/degree-photo', [App\Http\Controllers\Auth\TutorAuthController::class, 'getDegreePhoto']);

// Named login route for auth middleware
Route::get('/login', function () {
    return response()->json([
        'success' => false,
        'message' => 'Unauthenticated. Please login first.'
    ], 401);
})->name('login');