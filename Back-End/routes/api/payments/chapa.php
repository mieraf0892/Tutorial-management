<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PaymentController;

// Payment routes
Route::prefix('payments')->group(function () {
    // Initialize payment for tutorial enrollment
    Route::post('/tutorials/{tutorial}/enroll', [PaymentController::class, 'initialize']);
    
    // Verify payment status
    Route::get('/verify', [PaymentController::class, 'verify']);
    
    // Get payment history
    Route::get('/history', [PaymentController::class, 'history']);
    
    // Get payment details
    Route::get('/{payment}', [PaymentController::class, 'show']);
});

// Webhook route (no auth required - Chapa calls this)
Route::post('/payments/webhook/chapa', [PaymentController::class, 'webhookCallback'])
    ->name('payment.webhook');