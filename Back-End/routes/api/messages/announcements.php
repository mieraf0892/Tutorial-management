<?php

use App\Http\Controllers\Api\MessageController;
use Illuminate\Support\Facades\Route;

Route::prefix('messages')->group(function () {
    // Announcements
    Route::get('/announcements', [MessageController::class, 'announcements']);
});