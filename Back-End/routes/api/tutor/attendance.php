<?php

use App\Http\Controllers\Api\TutorController;
use Illuminate\Support\Facades\Route;

Route::prefix('tutor')->group(function () {
    // Attendance Management
    Route::get('/sessions', [TutorController::class, 'getSessions']);
    Route::post('/sessions/{session}/attendance', [TutorController::class, 'markAttendance']);
    Route::get('/attendance/{session}', [TutorController::class, 'getSessionAttendance']);
    Route::put('/attendance/{attendance}', [TutorController::class, 'updateAttendance']);
    Route::post('/sessions/{session}/attendance/bulk', [TutorController::class, 'bulkMarkAttendance']);
    Route::get('/tutorials/{tutorial}/attendance-report', [TutorController::class, 'getTutorialAttendanceReport']);
    Route::get('/students/{student}/attendance', [TutorController::class, 'getStudentAttendance']);
});