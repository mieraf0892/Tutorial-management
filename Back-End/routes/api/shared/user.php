<?php

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;

// Get current user info
Route::get('/user', [UserController::class, 'current']);

// Debug route
Route::get('/debug/tutor-check', [UserController::class, 'debugTutorCheck']);

// Logout
Route::post('/logout', [LoginController::class, 'logout']);

// Tutorial enrollment (available to students)
Route::post('/tutorials/{id}/enroll', [App\Http\Controllers\Api\TutorialController::class, 'enroll']);