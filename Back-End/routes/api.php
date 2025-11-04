<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\StudentAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ============================
// 🚀 Public Routes
// ============================

// Auth
Route::post('/register/student', [StudentAuthController::class, 'register']);
Route::post('/register/tutor', [App\Http\Controllers\Auth\TutorAuthController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

// ✅ Category Routes (public)
Route::get('/categories', [App\Http\Controllers\Api\CategoryController::class, 'index']);
Route::get('/categories/{slug}', [App\Http\Controllers\Api\CategoryController::class, 'show']);
// Add these routes
Route::get('/tutorials', [App\Http\Controllers\Api\TutorialController::class, 'index']);
Route::get('/tutorials/{id}', [App\Http\Controllers\Api\TutorialController::class, 'show']);
Route::get('/tutorials/categories/list', [App\Http\Controllers\Api\TutorialController::class, 'getCategories']);
Route::get('/tutorials/levels/list', [App\Http\Controllers\Api\TutorialController::class, 'getLevels']);

// Test API endpoint
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// ============================
// 🔐 Protected Routes (Require Authentication)
// ============================

Route::middleware(['auth:sanctum', 'admin'])->group(function () {

    // Admin dashboard data
    Route::get('/admin/dashboard', function (Request $request) {
        try {
            $totalUsers = \App\Models\User::count();
            $totalStudents = \App\Models\User::where('role', 'student')->count();
            $totalTutors = \App\Models\User::where('role', 'tutor')->count();
            $pendingVerifications = \App\Models\Tutor::where('is_verified', false)->count();

            return response()->json([
                'success' => true,
                'message' => 'Admin dashboard data',
                'stats' => [
                    'total_users' => $totalUsers,
                    'total_students' => $totalStudents,
                    'total_tutors' => $totalTutors,
                    'pending_verifications' => $pendingVerifications,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    });

    // Get all users
    Route::get('/admin/users', function () {
        try {
            $users = \App\Models\User::with(['student', 'tutor'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'users' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    });

    // Get all students
    Route::get('/admin/students', function () {
        $students = \App\Models\Student::with('user')->get();
        return response()->json([
            'success' => true,
            'students' => $students
        ]);
    });

    // Get all tutors
    Route::get('/admin/tutors', function () {
        $tutors = \App\Models\Tutor::with('user')->get();
        return response()->json([
            'success' => true,
            'tutors' => $tutors
        ]);
    });
});
