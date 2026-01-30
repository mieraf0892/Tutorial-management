<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ChapaController;
use Illuminate\Support\Facades\Mail;
use App\Mail\TutorWelcomeEmail;
use App\Mail\TutorRejectionEmail;
use App\Models\Tutor;
use App\Models\User;

// ============================
// 🚀 Load All Route Files
// ============================

// Public routes (no authentication required)
require __DIR__ . '/api/public.php';
require __DIR__ . '/api/shared/courses.php';
Route::get('/tutorials/{id}', [App\Http\Controllers\Api\TutorialController::class, 'show']);

// Authentication routes
require __DIR__ . '/api/auth.php';

// ============================
// 🔐 Protected Routes (Authenticated Users)
// ============================

Route::middleware(['auth:sanctum'])->group(function () {

    require __DIR__ . '/api/payments/chapa.php';
    
    // Common authenticated user routes
    require __DIR__ . '/api/shared/user.php';
    require __DIR__ . '/api/shared/lessons.php';
    // In your main api.php, inside the auth:sanctum middleware group
    require __DIR__ . '/api/shared/profile.php';
    
    // Student routes (only these are created so far)
    require __DIR__ . '/api/student/dashboard.php';
    require __DIR__ . '/api/student/profile.php';
    require __DIR__ . '/api/student/attendance.php';
    require __DIR__ . '/api/student/enrollment.php';
    require __DIR__ . '/api/student/individual-requests.php';
    // require __DIR__ . '/api/student/tutorials.php';
    // require __DIR__ . '/api/student/finance.php';

    
    // Tutor routes
    require __DIR__ . '/api/tutor/dashboard.php';
    require __DIR__ . '/api/tutor/profile.php';
    require __DIR__ . '/api/tutor/courses.php';
    require __DIR__ . '/api/tutor/attendance.php';
    require __DIR__ . '/api/tutor/students.php';
    require __DIR__ . '/api/tutor/tutorials.php'; 
    // require __DIR__ . '/api/tutor/finance.php';

    
    // Messaging routes
    require __DIR__ . '/api/messages/conversations.php';
    require __DIR__ . '/api/messages/messages.php';
    require __DIR__ . '/api/messages/announcements.php';
    
    // Shared routes (tutorial sessions)
    require __DIR__ . '/api/shared/sessions.php';
    
    // Admin routes
    require __DIR__ . '/api/admin/dashboard.php';
    require __DIR__ . '/api/admin/users.php';
    require __DIR__ . '/api/admin/classes.php';
    require __DIR__ . '/api/admin/courses.php';
    require __DIR__ . '/api/admin/individual-requests.php';
    require __DIR__ . '/api/admin/tutorials.php';
    require __DIR__ . '/api/admin/student-tutor-assignments.php';
    require __DIR__ . '/api/admin/attendance.php';
    require __DIR__ . '/api/admin/communication.php';
    require __DIR__ . '/api/admin/tutor_approvals.php';
    require __DIR__ . '/api/admin/email_queue.php';

    
    
    Route::get('/admin/categories-tree', [App\Http\Controllers\Api\CategoryController::class, 'adminTree']);
    // TEMPORARY: Comment out other routes until we create them
    /*
    // Super Admin routes
    require __DIR__ . '/api/super-admin/dashboard.php';
    require __DIR__ . '/api/super-admin/system.php';
    
    // Staff routes (if needed)
    require __DIR__ . '/api/staff.php';
    */
});

Route::middleware('auth:sanctum')->group(function () {
    // Replace the old StudentController reference with PaymentController
    Route::get('/student/payment-status', [PaymentController::class, 'getPaymentStatus']);
    Route::post('/student/update-course-selection', [PaymentController::class, 'updateCourseSelection']);
    Route::post('/student/complete-payment', [PaymentController::class, 'completePayment']);
    
    
    // Your existing dashboard route remains untouched
    require __DIR__ . '/api/student/dashboard.php';
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/payment/initialize', [ChapaController::class, 'initialize']);
    Route::get('/payment/verify/{tx_ref}', [ChapaController::class, 'verify'])
        ->name('payment.verify');
    Route::get('/payment/status', [ChapaController::class, 'status']);

        // Course selection
    Route::post('/payment/select-course', [PaymentController::class, 'updateSelectedCourse']);
    
    // Get payment status (updated)
    Route::get('/payment/status', [PaymentController::class, 'getPaymentStatus']);
    Route::get('/payment/available-courses', [PaymentController::class, 'getAvailableCourses']);
});

// ... existing requires ...

// Admin routes group (add this if not already present, or append to existing admin group)
Route::middleware('auth:sanctum')->group(function () {
    // Your new route here
    Route::get('/admin/tutorials', [\App\Http\Controllers\Api\AdminController::class, 'getTutorials']);

    // If you have other loose admin routes, move them here too
});

