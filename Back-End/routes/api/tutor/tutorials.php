<?php

use App\Http\Controllers\Api\TutorController;
use Illuminate\Support\Facades\Route;

Route::prefix('tutor')->group(function () {
    // Tutorial Management ONLY
    Route::get('/tutorials', [TutorController::class, 'getTutorTutorials']);
    Route::post('/tutorials', [TutorController::class, 'createTutorial']);
    Route::patch('/tutorials/{tutorial}/publish', [TutorController::class, 'publishTutorial']);
    Route::patch('/tutorials/{tutorial}/unpublish', [TutorController::class, 'unpublishTutorial']);
    
    // Content Management
    Route::post('/tutorials/{tutorial}/assignments', [TutorController::class, 'createAssignment']);
    Route::post('/tutorials/{tutorial}/materials', [TutorController::class, 'uploadMaterial']);
    
    // Finance
    Route::get('/payments', [TutorController::class, 'getPayments']);
});