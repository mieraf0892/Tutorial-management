<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::prefix('admin')->group(function () {
    // Attendance Tracking
    Route::get('/attendance', function (Request $request) {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        try {
            $query = \App\Models\Attendance::with(['user', 'tutorial', 'tutorialSession']);
            
            // Apply filters
            if ($request->has('tutorial_id')) {
                $query->where('tutorial_id', $request->tutorial_id);
            }
            
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }
            
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('session_date', [
                    $request->start_date,
                    $request->end_date
                ]);
            }

            $attendance = $query->orderBy('session_date', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'attendance' => $attendance
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance records',
                'error' => $e->getMessage()
            ], 500);
        }
    });

    // Attendance statistics
    Route::get('/attendance/stats', function (Request $request) {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        try {
            $stats = [
                'total_sessions' => \App\Models\Attendance::distinct('tutorial_session_id')->count(),
                'total_attendance_records' => \App\Models\Attendance::count(),
                'present_count' => \App\Models\Attendance::where('status', 'present')->count(),
                'absent_count' => \App\Models\Attendance::where('status', 'absent')->count(),
                'late_count' => \begingroup\Models\Attendance::where('status', 'late')->count(),
                'excused_count' => \App\Models\Attendance::where('status', 'excused')->count(),
                'attendance_rate' => \App\Models\Attendance::count() > 0 ? 
                    round((\App\Models\Attendance::whereIn('status', ['present', 'late'])->count() / \App\Models\Attendance::count()) * 100, 2) : 0
            ];

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    });
});