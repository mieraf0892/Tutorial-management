<?php

use App\Http\Controllers\Api\AdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->group(function () {
    // Existing tutorial approval routes
    Route::get('/tutorials/pending-approval', [AdminController::class, 'getPendingTutorials']);
    Route::post('/tutorials/{id}/approve',    [AdminController::class, 'approveTutorial']);
    Route::post('/tutorials/{id}/reject',     [AdminController::class, 'rejectTutorial']);
    Route::post('/tutorials/{id}/publish',    [AdminController::class, 'publishTutorial']);

    // NEW: List all tutorials (with optional course_id filter)
    Route::get('/tutorials', [AdminController::class, 'getTutorials']);
});