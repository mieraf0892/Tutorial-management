<?php

use Illuminate\Support\Facades\Route;

// Session routes (shared between tutor/student)
Route::get('/tutorials/{tutorial}/sessions', [App\Http\Controllers\Api\TutorialSessionController::class, 'index']);
Route::post('/tutorials/{tutorial}/sessions', [App\Http\Controllers\Api\TutorialSessionController::class, 'store']);
Route::put('/sessions/{session}', [App\Http\Controllers\Api\TutorialSessionController::class, 'update']);
Route::delete('/sessions/{session}', [App\Http\Controllers\Api\TutorialSessionController::class, 'destroy']);