<?php

use App\Http\Controllers\Api\AdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->group(function () {
    // User Management
    Route::get('/users', [AdminController::class, 'users']);
    Route::post('/users', [AdminController::class, 'createUser']);
    Route::put('/users/{user}', [AdminController::class, 'updateUser']);
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
    Route::post('/users/{user}/suspend', [AdminController::class, 'suspendUser']);
    Route::post('/users/{user}/activate', [AdminController::class, 'activateUser']);
    Route::post('/users/{user}/toggle-status', [AdminController::class, 'toggleUserStatus']);
    
    // Tutor Onboarding
    Route::get('/pending-tutors', [AdminController::class, 'pendingTutors']);
    Route::post('/tutors/{tutor}/approve', [AdminController::class, 'approveTutor']);
    Route::post('/tutors/{tutor}/reject', [AdminController::class, 'rejectTutor']);
    
    // Class Management
    Route::get('/classes', [AdminController::class, 'classes']);
    Route::post('/classes', [AdminController::class, 'createClass']);
    
    // Session Reports
    Route::get('/pending-reports', [AdminController::class, 'pendingReports']);
    Route::post('/reports/{report}/approve', [AdminController::class, 'approveReport']);
    Route::get('/tutors', function () {
    $tutors = \App\Models\User::where('role', 'tutor')
        ->where('status', 'active')  // or 'verified' — adjust if needed
        ->select('id', 'name', 'email')
        ->get();

    return response()->json([
        'success' => true,
        'tutors' => $tutors
    ]);
});
});

