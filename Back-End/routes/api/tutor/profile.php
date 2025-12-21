<?php

use App\Http\Controllers\Api\TutorProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('tutor')->group(function () {
    // Profile routes
    Route::prefix('profile')->group(function () {
        // Profile completion (for tutors with pending_profile status)
        Route::post('/complete', [TutorProfileController::class, 'completeProfile']);
        
        // Existing profile routes (should be accessible to active tutors)
        Route::get('/', [TutorProfileController::class, 'show']);
        Route::put('/', [TutorProfileController::class, 'update']);
        Route::post('/photo', [TutorProfileController::class, 'uploadPhoto']);
        Route::put('/contact', [TutorProfileController::class, 'updateContact']);
        Route::put('/password', [TutorProfileController::class, 'changePassword']);
    });
});