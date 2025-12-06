<?php

use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

Route::prefix('student')->group(function () {
    // Get tutors list for messaging
    Route::get('/tutors-list', [StudentController::class, 'tutorsList']);
});