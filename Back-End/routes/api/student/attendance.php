<?php

use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

Route::prefix('student')->group(function () {
    Route::get('/attendance', [StudentController::class, 'attendance']);
    Route::get('/tutorials/{tutorial}/attendance', [StudentController::class, 'getTutorialAttendance']);
    Route::get('/attendance/summary', [StudentController::class, 'getAttendanceSummary']);
});