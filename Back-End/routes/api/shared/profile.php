<?php
// routes/api/shared/profile.php

use App\Http\Controllers\Auth\StudentAuthController;
use App\Http\Controllers\Auth\TutorAuthController;
use Illuminate\Support\Facades\Route;

// Profile completion routes (protected)
Route::post('/profile/student/complete', [StudentAuthController::class, 'completeProfile']);
Route::post('/profile/tutor/complete', [TutorAuthController::class, 'completeProfile']);