<?php

use Illuminate\Support\Facades\Route;

// ============================
// 🚀 Load All Route Files
// ============================

// Public routes (no authentication required)
require __DIR__ . '/api/public.php';

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
    // require __DIR__ . '/api/student/tutorials.php';
    // require __DIR__ . '/api/student/finance.php';

    
    // Tutor routes
    require __DIR__ . '/api/tutor/dashboard.php';
    require __DIR__ . '/api/tutor/profile.php';
    require __DIR__ . '/api/tutor/tutorials.php';
    require __DIR__ . '/api/tutor/attendance.php';
    require __DIR__ . '/api/tutor/students.php';
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
    require __DIR__ . '/api/admin/attendance.php';
    require __DIR__ . '/api/admin/communication.php';
    require __DIR__ . '/api/admin/tutor_approvals.php';
    require __DIR__ . '/api/admin/email_queue.php';
    
    // TEMPORARY: Comment out other routes until we create them
    /*
    // Super Admin routes
    require __DIR__ . '/api/super-admin/dashboard.php';
    require __DIR__ . '/api/super-admin/system.php';
    
    // Staff routes (if needed)
    require __DIR__ . '/api/staff.php';
    */
});