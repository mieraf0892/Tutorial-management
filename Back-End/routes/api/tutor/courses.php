<?php
use App\Http\Controllers\Api\CourseController as TutorCourseController;
use Illuminate\Support\Facades\Route;

Route::prefix('tutor')->group(function () {
    // Course Management
    Route::get('/courses', [TutorCourseController::class, 'getTutorCourses']);
    Route::post('/courses', [TutorCourseController::class, 'createCourse']);
    Route::patch('/courses/{course}/publish', [TutorCourseController::class, 'publishCourse']);
    Route::patch('/courses/{course}/unpublish', [TutorCourseController::class, 'unpublishCourse']);
    // Submit draft for approval
    Route::post('/tutorials/{tutorial}/submit-approval', [TutorController::class, 'submitForApproval']);
    
    // Content Management
    Route::post('/courses/{course}/lessons', [TutorCourseController::class, 'createLesson']);
    Route::post('/courses/{course}/materials', [TutorCourseController::class, 'uploadMaterial']);
});