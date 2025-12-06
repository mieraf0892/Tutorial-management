<?php

use App\Http\Controllers\Api\MessageController;
use Illuminate\Support\Facades\Route;

Route::prefix('messages')->group(function () {
    // Messages with specific user
    Route::get('/{userId}', [MessageController::class, 'messages']);
    
    // Message actions
    Route::post('/send', [MessageController::class, 'send']);
    Route::post('/{id}/read', [MessageController::class, 'markAsRead']);
    Route::post('/{userId}/typing', [MessageController::class, 'typingIndicator']);
    
    // Stats
    Route::get('/unread-count', [MessageController::class, 'unreadCount']);
    
    // Debug
    Route::get('/debug/list', [MessageController::class, 'debugList']);
});