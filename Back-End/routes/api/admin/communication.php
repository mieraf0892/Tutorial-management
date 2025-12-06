<?php

use App\Http\Controllers\Api\AdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->group(function () {
    // Communication - ENHANCED WITH PROFESSIONAL FEATURES
    Route::post('/notifications', [AdminController::class, 'sendNotification']);
    Route::post('/send-announcement', [AdminController::class, 'sendAnnouncement']);
    Route::get('/communication-stats/{user}', [AdminController::class, 'communicationStats']);
    Route::get('/message-templates', [AdminController::class, 'getMessageTemplates']);
    Route::post('/message-templates', [AdminController::class, 'createMessageTemplate']);
    
    // Announcement Routes
    Route::post('/announcements', [AdminController::class, 'createAnnouncement']);
    Route::get('/announcements', [AdminController::class, 'getAnnouncements']);
    Route::post('/users/count-by-filters', [AdminController::class, 'getUserCountByFilters']);
    
    // Template Routes
    Route::get('/announcement-templates', [AdminController::class, 'getTemplates']);
    Route::post('/announcement-templates', [AdminController::class, 'createTemplate']);
});