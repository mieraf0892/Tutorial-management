<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CourseController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('admin')->group(function () {
        // Course CRUD operations
        Route::apiResource('courses', CourseController::class);
        
        // Additional course routes
        Route::get('courses/categories/all', [CourseController::class, 'categories']);
        Route::post('/courses/{course}/assign-tutors', [CourseController::class, 'assignTutors']);
        
        // Debug route
        Route::get('debug-courses-fixed', function() {
            return response()->json(['message' => 'Courses routes are now properly prefixed']);
            
        });
    });
});
