<?php

use App\Http\Controllers\Api\StudentProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('student')->group(function () {
    // Profile routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [StudentProfileController::class, 'show']);
        Route::put('/', [StudentProfileController::class, 'update']);
        Route::put('/learning-preferences', [StudentProfileController::class, 'updateLearningPreferences']);
        Route::post('/photo', [StudentProfileController::class, 'uploadPhoto']);
        Route::put('/contact', [StudentProfileController::class, 'updateContact']);
        Route::put('/password', [StudentProfileController::class, 'changePassword']);
    });
});