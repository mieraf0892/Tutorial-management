<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TutorApprovalController;
use App\Http\Controllers\Auth\TutorAuthController;
use App\Http\Controllers\Api\AdminController;

Route::prefix('tutor-approvals')->group(function () {
    // Get all pending tutor registrations
    Route::get('/pending', [TutorApprovalController::class, 'pendingTutors']);
    
    // Get approval statistics
    Route::get('/stats', [TutorApprovalController::class, 'approvalStats']);
    
    // Get tutor details for review
    Route::get('/{id}', [TutorApprovalController::class, 'getTutorDetails']);
    
    // Approve a tutor
    Route::post('/{id}/approve', [TutorApprovalController::class, 'approveTutor']);
    
    // Reject a tutor
    Route::post('/{id}/reject', [TutorApprovalController::class, 'rejectTutor']);
    
    // ============================================
    // 🎓 DEGREE VERIFICATION ROUTES
    // ============================================
    
    // Get tutors with pending degree verification
    Route::get('/pending-degree', [AdminController::class, 'getTutorsWithPendingDegree']);
    
    // Get degree verification statistics
    Route::get('/degree-stats', [AdminController::class, 'getDegreeVerificationStats']);
    
    // Approve tutor's degree
    Route::post('/{id}/approve-degree', [AdminController::class, 'approveDegree']);
    
    // Reject tutor's degree
    Route::post('/{id}/reject-degree', [AdminController::class, 'rejectDegree']);
});