<?php

use App\Http\Controllers\Api\TutorController;
use Illuminate\Support\Facades\Route;

Route::prefix('tutor')->group(function () {
    // Dashboard
    Route::get('/dashboard', [TutorController::class, 'dashboard']);
});