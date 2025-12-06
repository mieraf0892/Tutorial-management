<?php

use App\Http\Controllers\Api\TutorProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('tutor')->group(function () {
    // Profile routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [TutorProfileController::class, 'show']);
        Route::put('/', [TutorProfileController::class, 'update']);
        Route::post('/photo', [TutorProfileController::class, 'uploadPhoto']);
        Route::put('/contact', [TutorProfileController::class, 'updateContact']);
        Route::put('/password', [TutorProfileController::class, 'changePassword']);
    });
});