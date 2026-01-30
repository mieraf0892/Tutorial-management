<?php

use App\Http\Controllers\Api\StudentTutorAssignmentController;
use Illuminate\Support\Facades\Route;

// Remove any middleware that references 'admin' as a parameter
Route::middleware(['auth:sanctum'])->group(function () {
    // Check if user is admin in controller instead
    Route::prefix('admin')->group(function () {
        Route::get('/student-tutor-assignments', [StudentTutorAssignmentController::class, 'index']);
        Route::post('/student-tutor-assignments', [StudentTutorAssignmentController::class, 'store']);
        Route::delete('/student-tutor-assignments/{id}', [StudentTutorAssignmentController::class, 'destroy']);
    });
});