<?php

use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

// Add the student prefix
Route::prefix('student')->group(function () {
    Route::get('/dashboard', [StudentController::class, 'dashboard']);
    Route::get('/enrolled-tutorials', [StudentController::class, 'enrolledTutorials']);
    Route::get('/preferences', [StudentController::class, 'getPreferences']);
});