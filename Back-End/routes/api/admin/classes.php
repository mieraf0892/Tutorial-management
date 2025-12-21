<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('admin')->group(function () {
        // Class Management Routes
        Route::get('/classes', [AdminController::class, 'classes']);
        Route::post('/classes', [AdminController::class, 'createClass']);
        Route::get('/classes/{class}', [AdminController::class, 'getClassDetails']);
        Route::put('/classes/{class}', [AdminController::class, 'updateClass']);
        Route::delete('/classes/{class}', [AdminController::class, 'deleteClass']);
        
        // Class Enrollment Management
        Route::get('/classes/{class}/students', [AdminController::class, 'getClassStudents']);
        Route::post('/classes/{class}/enroll', [AdminController::class, 'enrollStudent']);
        Route::delete('/classes/{class}/students/{student}', [AdminController::class, 'removeStudent']);
        
        // ==============================
        // NEW: Tutorial Approval Workflow
        // ==============================
        
        // Get tutorials pending approval (created by tutors)
        Route::get('/tutorials/pending-approval', [AdminController::class, 'getPendingTutorials']);
        
        // Approve a tutor-created tutorial
        Route::post('/tutorials/{tutorial}/approve', [AdminController::class, 'approveTutorial']);
        
        // Reject a tutor-created tutorial
        Route::post('/tutorials/{tutorial}/reject', [AdminController::class, 'rejectTutorial']);
        
        // Publish a tutorial (make visible to students)
        Route::post('/tutorials/{tutorial}/publish', [AdminController::class, 'publishTutorial']);
        
        // Archive a tutorial
        Route::post('/tutorials/{tutorial}/archive', [AdminController::class, 'archiveTutorial']);
        
        // Get all assignments (admin view)
        Route::get('/assignments', [AdminController::class, 'getAssignments']);
        
        // Assign tutor to existing tutorial
        Route::post('/tutorials/{tutorial}/assign', [AdminController::class, 'assignTutor']);
    });
});