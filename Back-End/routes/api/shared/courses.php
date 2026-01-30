<?php
use App\Http\Controllers\Api\CourseController;
use Illuminate\Support\Facades\Route;

Route::prefix('courses')->group(function () {
    // Public routes (no auth needed)
    Route::get('/', [CourseController::class, 'index']);
    Route::get('/{course}', [CourseController::class, 'show']);
    Route::get('/categories/list', [CourseController::class, 'categories']);
    Route::get('/levels/list', [CourseController::class, 'levels']);
    
    // Protected routes (authenticated)
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/{course}/enroll', [CourseController::class, 'enroll']);
        Route::get('/{course}/progress', [CourseController::class, 'progress']);
    });
});