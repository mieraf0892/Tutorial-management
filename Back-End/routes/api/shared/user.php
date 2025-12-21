<?php

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\ProfileCompletionController;
use Illuminate\Support\Facades\Route;

// Get current user info
Route::get('/user', [UserController::class, 'current']);

// Profile completion routes
Route::get('/profile/check', [ProfileCompletionController::class, 'checkProfileCompletion']);
Route::post('/profile/student/complete', [ProfileCompletionController::class, 'completeStudentProfile']);
Route::post('/profile/tutor/complete', [ProfileCompletionController::class, 'completeTutorProfile']);

// Debug route
Route::get('/debug/tutor-check', [UserController::class, 'debugTutorCheck']);

// Logout
Route::post('/logout', [LoginController::class, 'logout']);

// Tutorial enrollment (available to students)
Route::post('/tutorials/{id}/enroll', [App\Http\Controllers\Api\TutorialController::class, 'enroll']);