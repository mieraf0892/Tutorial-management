<?php

use Illuminate\Support\Facades\Route;

// Use full qualified name to avoid any reflection/import issues
Route::prefix('tutor')->group(function () {
    // Tutorial Management ONLY (your existing routes)
    Route::get('/tutorials', [\App\Http\Controllers\Api\TutorController::class, 'getTutorTutorials']);
    Route::post('/tutorials', [\App\Http\Controllers\Api\TutorController::class, 'createTutorial']);
    Route::patch('/tutorials/{tutorial}/publish', [\App\Http\Controllers\Api\TutorController::class, 'publishTutorial']);
    Route::patch('/tutorials/{tutorial}/unpublish', [\App\Http\Controllers\Api\TutorController::class, 'unpublishTutorial']);
    
    // Content Management - Assignments & Materials (your existing)
    Route::post('/tutorials/{tutorial}/assignments', [\App\Http\Controllers\Api\TutorController::class, 'createAssignment']);
    Route::post('/tutorials/{tutorial}/materials',   [\App\Http\Controllers\Api\TutorController::class, 'uploadMaterial']);

    // FIXED LESSONS ROUTES - Properly nested under specific tutorial
    Route::prefix('tutorials/{tutorial}')->group(function () {
        Route::get('lessons',    [\App\Http\Controllers\Api\TutorController::class, 'getLessons']);
        Route::post('lessons',   [\App\Http\Controllers\Api\TutorController::class, 'createLesson']);
        Route::put('lessons/{lesson}',    [\App\Http\Controllers\Api\TutorController::class, 'updateLesson']);
        Route::delete('lessons/{lesson}', [\App\Http\Controllers\Api\TutorController::class, 'deleteLesson']);
    });

    // Finance
    Route::get('/payments', [\App\Http\Controllers\Api\TutorController::class, 'getPayments']);
});