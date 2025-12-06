<?php

use Illuminate\Support\Facades\Route;

// Test endpoint
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Category Routes (public)
Route::get('/categories', [App\Http\Controllers\Api\CategoryController::class, 'index']);
Route::get('/categories/{slug}', [App\Http\Controllers\Api\CategoryController::class, 'show']);

// Tutorial Routes (public)
Route::get('/tutorials', [App\Http\Controllers\Api\TutorialController::class, 'index']);
Route::get('/tutorials/{id}', [App\Http\Controllers\Api\TutorialController::class, 'show']);
Route::get('/tutorials/categories/list', [App\Http\Controllers\Api\TutorialController::class, 'getCategories']);
Route::get('/tutorials/levels/list', [App\Http\Controllers\Api\TutorialController::class, 'getLevels']);