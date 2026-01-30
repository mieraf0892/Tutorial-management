<?php
// app/Http/Controllers/Api/IndividualRequestController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IndividualRequest;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class IndividualRequestController extends Controller
{
    /**
     * Display a listing of individual requests (admin only).
     */

public function index(Request $request)
{
    try {
        $query = IndividualRequest::with(['student', 'course', 'tutor']);
        
        // If user is student, only show their own requests
        if ($request->user()->role === 'student') {
            $query->where('student_id', $request->user()->id);
        } 
        // If user is admin/super_admin, show all (with filters)
        elseif (in_array($request->user()->role, ['admin', 'super_admin'])) {
            // Admin filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            if ($request->has('course_id')) {
                $query->where('course_id', $request->course_id);
            }
            
            if ($request->has('student_id')) {
                $query->where('student_id', $request->student_id);
            }
            
            if ($request->has('search')) {
                $query->where(function ($q) use ($request) {
                    $q->whereHas('student', function ($q2) use ($request) {
                        $q2->where('name', 'like', '%' . $request->search . '%')
                           ->orWhere('email', 'like', '%' . $request->search . '%');
                    })->orWhereHas('course', function ($q2) use ($request) {
                        $q2->where('title', 'like', '%' . $request->search . '%');
                    });
                });
            }
        } else {
            // For tutors or other roles
            return response()->json(['error' => 'Forbidden', 'message' => 'Access denied'], 403);
        }
        
        // Sort by newest first
        $query->orderBy('created_at', 'desc');
        
        // Pagination
        $perPage = $request->get('per_page', 10);
        $requests = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'message' => 'Individual requests retrieved successfully',
            'data' => $requests
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve individual requests',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Store a new individual request (student creates request).
     */
    public function store(Request $request)
    {
        // Student only
        if ($request->user()->role !== 'student') {
            return response()->json(['error' => 'Forbidden', 'message' => 'Student access required'], 403);
        }

        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
            'special_requirements' => 'nullable|string',
            'preferred_hours_per_week' => 'required|integer|min:1|max:20',
            'preferred_schedule' => 'nullable|array',
            'preferred_start_date' => 'required|date|after_or_equal:today',
            'duration_weeks' => 'required|integer|min:1|max:52',
            'hourly_rate' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $course = Course::find($request->course_id);
            
            // Calculate price if not provided
            $hourlyRate = $request->hourly_rate ?: $course->price_individual;
            $totalHours = $request->preferred_hours_per_week * $request->duration_weeks;
            $totalPrice = $hourlyRate * $totalHours;

            $individualRequest = IndividualRequest::create([
                'student_id' => $request->user()->id,
                'course_id' => $request->course_id,
                'special_requirements' => $request->special_requirements,
                'preferred_hours_per_week' => $request->preferred_hours_per_week,
                'preferred_schedule' => $request->preferred_schedule,
                'preferred_start_date' => $request->preferred_start_date,
                'duration_weeks' => $request->duration_weeks,
                'hourly_rate' => $hourlyRate,
                'total_price' => $totalPrice,
                'status' => IndividualRequest::STATUS_PENDING,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Individual tutorial request submitted successfully',
                'data' => $individualRequest->load(['course'])
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified individual request.
     */
    public function show($id)
    {
        try {
            $individualRequest = IndividualRequest::with(['student', 'course', 'tutor'])->find($id);
            
            if (!$individualRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'Individual request not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Individual request retrieved successfully',
                'data' => $individualRequest
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve individual request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified individual request (admin: assign tutor, update status).
     */
    public function update(Request $request, $id)
    {
        // Admin only
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        $individualRequest = IndividualRequest::find($id);
        
        if (!$individualRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Individual request not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'tutor_id' => 'nullable|exists:users,id',
            'status' => 'sometimes|in:pending,reviewing,searching,matched,scheduled,ongoing,completed,cancelled,rejected',
            'admin_notes' => 'nullable|string',
            'hourly_rate' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();
            
            $updates = $request->only(['status', 'admin_notes', 'hourly_rate']);
            
            // If assigning a tutor
            if ($request->has('tutor_id')) {
                $tutor = User::find($request->tutor_id);
                
                if ($tutor->role !== 'tutor') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Selected user is not a tutor'
                    ], 422);
                }
                
                $updates['tutor_id'] = $tutor->id;
                $updates['status'] = 'matched'; // Auto-update status when tutor assigned
            }
            
            // Recalculate total price if hourly_rate changes
            if ($request->has('hourly_rate')) {
                $totalHours = $individualRequest->preferred_hours_per_week * $individualRequest->duration_weeks;
                $updates['total_price'] = $request->hourly_rate * $totalHours;
            }
            
            $individualRequest->update($updates);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Individual request updated successfully',
                'data' => $individualRequest->fresh(['student', 'course', 'tutor'])
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update individual request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available tutors for a course (for admin assignment).
     */
    public function getAvailableTutors($courseId)
    {
        try {
            $course = Course::find($courseId);
            
            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found'
                ], 404);
            }
            
            // Get tutors who teach this category
            $tutors = User::where('role', 'tutor')
                ->where('status', 'active')
                ->whereHas('tutorProfile', function ($query) use ($course) {
                    $query->whereJsonContains('expertise', $course->category)
                          ->orWhere('expertise', 'like', '%' . $course->category . '%');
                })
                ->select('id', 'name', 'email', 'profile_photo')
                ->get();
            
            return response()->json([
                'success' => true,
                'message' => 'Available tutors retrieved',
                'data' => $tutors
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve available tutors',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for admin dashboard.
     */
    public function stats()
    {
        try {
            $stats = [
                'total' => IndividualRequest::count(),
                'pending' => IndividualRequest::where('status', 'pending')->count(),
                'matched' => IndividualRequest::where('status', 'matched')->count(),
                'ongoing' => IndividualRequest::where('status', 'ongoing')->count(),
                'completed' => IndividualRequest::where('status', 'completed')->count(),
                'by_category' => IndividualRequest::with('course')
                    ->get()
                    ->groupBy('course.category')
                    ->map->count(),
            ];
            
            return response()->json([
                'success' => true,
                'message' => 'Individual request statistics retrieved',
                'data' => $stats
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}