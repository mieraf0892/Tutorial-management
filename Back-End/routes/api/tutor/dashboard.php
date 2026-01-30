<?php

use App\Http\Controllers\Api\TutorController;
use Illuminate\Support\Facades\Route;

Route::prefix('tutor')->group(function () {
    // Dashboard
    Route::get('/dashboard', [TutorController::class, 'dashboard']);
    
    // ==============================
    // Course Assignment Management
    // ==============================
    
    // Get ALL assignments (individual + classes) grouped by status
    Route::get('/assignments', [TutorController::class, 'getAssignments']);
    
    // Accept an assignment or class (with type parameter)
    Route::post('/assignments/{id}/accept', [TutorController::class, 'acceptAssignment'])
        ->where('id', '[0-9]+');
    
    // Reject an assignment or class (with type parameter and reason)
    Route::post('/assignments/{id}/reject', [TutorController::class, 'rejectAssignment'])
        ->where('id', '[0-9]+');
    
    // 🆕 NEW: Get tutor's accepted courses for tutorial creation
    Route::get('/accepted-courses', [TutorController::class, 'getCourses']);
    
    // ==============================
    // Tutorial Workflow
    // ==============================
    
    // 🆕 NEW: Create tutorial (with optional course_id)
    Route::post('/tutorials', [TutorController::class, 'createTutorial']);
    
    Route::post('/tutorials/{tutorial}/submit-for-review', [TutorController::class, 'submitForReview']);
    Route::post('/tutorials/{tutorial}/mark-as-completed', [TutorController::class, 'markAsCompleted']);
});