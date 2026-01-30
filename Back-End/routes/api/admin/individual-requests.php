<?php
// routes/api/admin/individual-requests.php

use App\Http\Controllers\Api\IndividualRequestController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Individual Tutorial Requests Routes (Admin)
|--------------------------------------------------------------------------
*/

// Admin individual requests routes
Route::prefix('individual-requests')->group(function () {
    Route::get('/', [IndividualRequestController::class, 'index']);
    Route::get('/stats', [IndividualRequestController::class, 'stats']);
    Route::get('/{id}', [IndividualRequestController::class, 'show']);
    Route::put('/{id}', [IndividualRequestController::class, 'update']);
    Route::get('/{courseId}/available-tutors', [IndividualRequestController::class, 'getAvailableTutors']);
});