<?php
// routes/api/student/individual-requests.php

use App\Http\Controllers\Api\IndividualRequestController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Student Individual Tutorial Requests Routes
|--------------------------------------------------------------------------
*/

// Student individual requests routes
Route::prefix('individual-requests')->group(function () {
    Route::post('/', [IndividualRequestController::class, 'store']);
    Route::get('/', [IndividualRequestController::class, 'index']); // Student can view their own requests
    Route::get('/{id}', [IndividualRequestController::class, 'show']); // Student can view specific request
});