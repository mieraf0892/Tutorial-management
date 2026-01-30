<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CourseController;


// Test endpoint
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

Route::get('/homepage-stats', [App\Http\Controllers\Api\StatsController::class, 'getHomepageStats']);

// Category Routes (public)
Route::get('/categories', [App\Http\Controllers\Api\CategoryController::class, 'index']);
Route::get('/categories/{slug}', [App\Http\Controllers\Api\CategoryController::class, 'show']);

// Tutorial Routes (public)
Route::get('/tutorials', [App\Http\Controllers\Api\TutorialController::class, 'index']);
Route::get('/tutorials/{id}', [App\Http\Controllers\Api\TutorialController::class, 'show']);
Route::get('/tutorials/categories/list', [App\Http\Controllers\Api\TutorialController::class, 'getCategories']);
Route::get('/tutorials/levels/list', [App\Http\Controllers\Api\TutorialController::class, 'getLevels']);

Route::get('/courses', [CourseController::class, 'publicIndex']);
Route::get('/courses/featured', [CourseController::class, 'publicIndex']); // with ?featured=1

// Email verification
Route::get('/verify-email/{token}', [App\Http\Controllers\Auth\EmailVerificationController::class, 'verify']);
Route::post('/verify-email/resend', [App\Http\Controllers\Auth\EmailVerificationController::class, 'resend']);
Route::post('/verify-email/check', [App\Http\Controllers\Auth\EmailVerificationController::class, 'checkStatus']);

// Test email routes (development only - remove in production)
if (app()->environment('local', 'development', 'testing')) {
    Route::get('/test-email-verification', function() {
        // Create test user
        $user = \App\Models\User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => 'student',
            'email_verification_token' => bin2hex(random_bytes(32)),
            'email_verified_at' => null,
        ]);
        
        // Send verification email
        \Illuminate\Support\Facades\Mail::to($user->email)
            ->send(new \App\Mail\EmailVerificationMail($user));
        
        return response()->json([
            'message' => 'Test verification email sent',
            'verification_url' => url('/api/verify-email/' . $user->email_verification_token),
        ]);
    });
}