<?php

use App\Http\Controllers\Api\TutorController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::prefix('tutor')->group(function () {
    // Student Management
    Route::get('/students', [TutorController::class, 'getStudents']);
    Route::get('/tutorials/{tutorial}/students', [TutorController::class, 'getTutorialStudents']);
    
    // Schedule Management
    Route::get('/schedule', [TutorController::class, 'getSchedule']);
    Route::post('/availability', [TutorController::class, 'setAvailability']);
    
    // Reports
    Route::post('/sessions/{session}/report', [TutorController::class, 'submitSessionReport']);
    
    Route::get('/students-list', [TutorController::class, 'studentsList']);
});