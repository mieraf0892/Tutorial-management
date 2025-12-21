<?php

use App\Http\Controllers\Api\TutorController;
use Illuminate\Support\Facades\Route;

Route::prefix('tutor')->group(function () {
    // Dashboard
    Route::get('/dashboard', [TutorController::class, 'dashboard']);
    
    // ==============================
    // Assignment Management
    // ==============================
    
    // Get assignments for current tutor
    Route::get('/assignments', [TutorController::class, 'getAssignments']);
    
    // Get pending assignments
    Route::get('/assignments/pending', [TutorController::class, 'getPendingAssignments']);
    
    // Accept an assignment
    Route::post('/assignments/{assignment}/accept', [TutorController::class, 'acceptAssignment']);
    
    // Reject an assignment
    Route::post('/assignments/{assignment}/reject', [TutorController::class, 'rejectAssignment']);
    
    // Get assigned tutorials (accepted assignments)
    Route::get('/assigned-tutorials', [TutorController::class, 'getAssignedTutorials']);
    
    // Get tutorial creation statistics
    Route::get('/tutorial-stats', [TutorController::class, 'getTutorialStats']);
    
    // ==============================
    // Tutorial Workflow
    // ==============================
    
    Route::post('/tutorials/{tutorial}/submit-for-review', [TutorController::class, 'submitForReview']);
    Route::post('/tutorials/{tutorial}/mark-as-completed', [TutorController::class, 'markAsCompleted']);
});