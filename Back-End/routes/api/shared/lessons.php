<?php
// routes/api/shared/lessons.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\LessonController;

// Lesson routes (shared between students and tutors)
Route::prefix('tutorials/{tutorial}')->group(function () {
    // Get specific lesson
    Route::get('/lessons/{lesson}', [LessonController::class, 'show']);
    
    // Get tutorial progress
    Route::get('/progress', [LessonController::class, 'progress']);
});

// Mark lesson as completed
Route::post('/lessons/{lesson}/complete', [LessonController::class, 'complete']);