<?php

use App\Http\Controllers\Api\AdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
});

Route::prefix('email-queue')->group(function () {
    Route::get('/', [AdminController::class, 'getEmailQueue']);
    Route::get('/stats', [AdminController::class, 'getEmailQueueStats']);
    Route::get('/{id}', [AdminController::class, 'getEmailQueueDetails']);
    Route::get('/token/{token}', [AdminController::class, 'searchEmailQueueByToken']);
    Route::delete('/clear', [AdminController::class, 'clearEmailQueue']);
    Route::post('/simulate', [AdminController::class, 'simulateEmail']);
    
});