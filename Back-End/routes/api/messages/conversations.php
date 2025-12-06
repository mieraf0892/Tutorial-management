<?php

use App\Http\Controllers\Api\MessageController;
use Illuminate\Support\Facades\Route;

Route::prefix('messages')->group(function () {
    // Conversations
    Route::get('/conversations', [MessageController::class, 'conversations']);
    
    // REMOVED LEGACY ROUTES:
    // Route::get('/conversations', [App\Http\Controllers\ConversationController::class, 'index']); 
    // Route::post('/conversations/start', [App\Http\Controllers\ConversationController::class, 'start']);
});