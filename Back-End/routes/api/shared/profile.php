<?php
// routes/api/shared/profile.php

use App\Http\Controllers\Auth\RegistrationController;
use Illuminate\Support\Facades\Route;

// Profile completion routes (protected)
Route::post('/profile/student/complete', [RegistrationController::class, 'completeStudentProfile']);
Route::post('/profile/tutor/complete', [RegistrationController::class, 'completeTutorProfile']);