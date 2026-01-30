<?php

use App\Http\Controllers\Api\ClassRoomController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->group(function () {

    // Class CRUD
    Route::apiResource('classes', ClassRoomController::class);

    // Class statistics
    Route::get('classes/stats', [ClassRoomController::class, 'stats']);

    // ✅ This is the endpoint your frontend is calling
    Route::post(
        'classes/from-assignments',
        [ClassRoomController::class, 'createFromAssignments']
    );

    Route::post(
        'classes/{class}/add-assignments',
        [ClassRoomController::class, 'addAssignments']
    );

    Route::post(
        'classes/{class}/remove-assignment/{assignment}',
        [ClassRoomController::class, 'removeAssignment']
    );
});
