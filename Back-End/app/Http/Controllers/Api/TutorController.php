<?php
// app/Http/Controllers/Api/TutorController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tutorial;
use App\Models\TutorialSession;
use App\Models\Attendance;
use App\Models\Enrollment;
use App\Models\TutorialAssignment;
use App\Models\User;
use App\Models\LiveSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TutorController extends Controller
{
    // Get tutor dashboard data
    public function dashboard()
    {
        try {
            $user = Auth::user();
            $tutor = $user->tutor;

            if (!$tutor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tutor profile not found'
                ], 404);
            }

            // Get tutorials created by this tutor
            $tutorials = Tutorial::where('tutor_id', $user->id)->get();

            // Calculate stats
            $totalTutorials = $tutorials->count();
            $totalStudents = Enrollment::whereIn('tutorial_id', $tutorials->pluck('id'))->distinct('user_id')->count();
            
            // Get tutorial sessions
            $upcomingSessions = TutorialSession::with('tutorial')
                ->where('tutor_id', $user->id)
                ->where('status', 'scheduled')
                ->where('start_time', '>', now())
                ->orderBy('start_time', 'asc')
                ->get();

            $completedSessions = TutorialSession::where('tutor_id', $user->id)
                ->where('status', 'completed')
                ->count();

            // Get recent students
            $recentStudents = User::where('role', 'student')
                ->whereHas('enrollments', function($query) use ($tutorials) {
                    $query->whereIn('tutorial_id', $tutorials->pluck('id'));
                })
                ->with(['enrollments.tutorial'])
                ->limit(10)
                ->get()
                ->map(function($student) {
                    $latestEnrollment = $student->enrollments->sortByDesc('created_at')->first();
                    return [
                        'id' => $student->id,
                        'name' => $student->name,
                        'email' => $student->email,
                        'tutorial_id' => $latestEnrollment->tutorial_id ?? null,
                        'tutorial_title' => $latestEnrollment->tutorial->title ?? 'N/A',
                        'enrollment_date' => $latestEnrollment->created_at ?? $student->created_at,
                        'progress_percentage' => 0, // You can calculate this based on lesson completions
                        'last_accessed' => $student->updated_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'dashboard' => [
                    'tutor' => [
                        'name' => $user->name,
                        'email' => $user->email,
                        'profile' => $tutor
                    ],
                    'stats' => [
                        'total_tutorials' => $totalTutorials,
                        'total_students' => $totalStudents,
                        'upcoming_sessions' => $upcomingSessions->count(),
                        'completed_sessions' => $completedSessions,
                        'total_earnings' => 0, // You can calculate this from payments
                        'average_rating' => 4.5, // You can calculate this from reviews
                    ],
                    'tutorials' => $tutorials->map(function($tutorial) {
    $studentCount = Enrollment::where('tutorial_id', $tutorial->id)->count();
    $sessionCount = TutorialSession::where('tutorial_id', $tutorial->id)->count();
    $completedSessionCount = TutorialSession::where('tutorial_id', $tutorial->id)
        ->where('status', 'completed')
        ->count();

    return [
        'id' => $tutorial->id,
        'title' => $tutorial->title,
        'description' => $tutorial->description,
        'category' => $tutorial->category->name ?? 'Uncategorized',
        'image' => $tutorial->image,
        'student_count' => $studentCount,
        'total_sessions' => $sessionCount,
        'completed_sessions' => $completedSessionCount,
        'created_at' => $tutorial->created_at,
        // ADD THESE FIELDS:
        'status' => $tutorial->status,
        'is_published' => $tutorial->is_published,
        'rejection_reason' => $tutorial->rejection_reason,
        'course_id' => $tutorial->course_id,
        'course_title' => $tutorial->course->title ?? null,
    ];
}),
                    'upcoming_sessions' => $upcomingSessions->map(function($session) {
                        $studentCount = Enrollment::where('tutorial_id', $session->tutorial_id)->count();
                        $attendanceMarked = Attendance::where('tutorial_session_id', $session->id)->exists();

                        return [
                            'id' => $session->id,
                            'tutorial_id' => $session->tutorial_id,
                            'tutorial_title' => $session->tutorial->title,
                            'title' => $session->title,
                            'start_time' => $session->start_time,
                            'end_time' => $session->end_time,
                            'status' => $session->status,
                            'meeting_link' => $session->meeting_link,
                            'student_count' => $studentCount,
                            'attendance_marked' => $attendanceMarked,
                        ];
                    }),
                    'pending_assignments' => TutorialAssignment::where('tutor_id', $user->id)
                        ->where('status', 'pending')
                        ->count(),
                    'assigned_tutorials' => TutorialAssignment::where('tutor_id', $user->id)
                        ->where('status', 'accepted')
                        ->count(),
                    'recent_students' => $recentStudents,
                    'recent_payments' => [], // You can populate this from your payments table
                    'unread_messages' => 0, // You can calculate this from messages
                    'notifications' => 0, // You can calculate this from notifications
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Tutor dashboard error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load tutor dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
 * Get students list for messaging
 */
public function studentsList(Request $request)
{
    try {
        $tutor = $request->user();
        
        if ($tutor->role !== 'tutor') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Tutors only.'
            ], 403);
        }

        // Get students enrolled in this tutor's tutorials
        $students = \App\Models\User::where('role', 'student')
            ->whereHas('enrollments.tutorial', function($query) use ($tutor) {
                $query->where('tutor_id', $tutor->id);
            })
            ->with(['enrollments.tutorial'])
            ->get()
            ->map(function($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'tutorials' => $student->enrollments->map(function($enrollment) {
                        return $enrollment->tutorial->title;
                    })
                ];
            });

        return response()->json([
            'success' => true,
            'students' => $students
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch students',
            'error' => $e->getMessage()
        ], 500);
    }
}

    // Mark attendance for a session
    public function markAttendance(Request $request, $sessionId)
    {
        try {
            $user = Auth::user();
            $session = TutorialSession::findOrFail($sessionId);

            // Check if the session belongs to this tutor
            if ($session->tutor_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to mark attendance for this session'
                ], 403);
            }

            $attendanceData = $request->input('attendance', []);

            // Create attendance records for each student
            foreach ($attendanceData as $studentAttendance) {
                Attendance::updateOrCreate(
                    [
                        'user_id' => $studentAttendance['student_id'],
                        'tutorial_session_id' => $sessionId,
                        'tutorial_id' => $session->tutorial_id,
                    ],
                    [
                        'session_date' => $session->start_time,
                        'status' => $studentAttendance['status'],
                        'duration_minutes' => $session->duration_minutes,
                        'instructor_notes' => $studentAttendance['notes'] ?? null,
                        'session_type' => $session->session_type,
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Attendance marked successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Mark attendance error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark attendance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get sessions for tutor
    public function getSessions()
{
    try {
        $user = Auth::user();
        
        $sessions = TutorialSession::with('tutorial')
            ->where('tutor_id', $user->id)
            ->orderBy('start_time', 'desc')
            ->get()
            ->map(function($session) {
                $studentCount = Enrollment::where('tutorial_id', $session->tutorial_id)->count();
                $attendanceMarked = Attendance::where('tutorial_session_id', $session->id)->exists();

                return [
                    'id' => $session->id,
                    'tutorial_id' => $session->tutorial_id,
                    'tutorial_title' => $session->tutorial->title,
                    'title' => $session->title,
                    'description' => $session->description,
                    'start_time' => $session->start_time,
                    'end_time' => $session->end_time,
                    'status' => $session->status,
                    'meeting_link' => $session->meeting_link,
                    'session_type' => $session->session_type,
                    'duration_minutes' => $session->duration_minutes,
                    'student_count' => $studentCount,
                    'attendance_marked' => $attendanceMarked,
                ];
            });

        return response()->json([
            'success' => true,
            'sessions' => $sessions
        ]);

    } catch (\Exception $e) {
        Log::error('Get tutor sessions error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch sessions',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get tutor's accepted courses (for creating tutorials)
 */
public function getCourses(Request $request)
{
    try {
        $user = Auth::user();
        
        // Get accepted individual assignments grouped by course
        $individualCourses = DB::table('student_tutor_assignments as sta')
            ->select(
                'c.id as course_id',
                'c.title as course_title',
                'c.description as course_description',
                'c.duration_hours',
                DB::raw("'individual' as assignment_type"),
                DB::raw('COUNT(DISTINCT sta.student_id) as student_count'),
                DB::raw('GROUP_CONCAT(DISTINCT s.name) as student_names'),
                DB::raw('MAX(sta.created_at) as last_assignment_date')
            )
            ->join('courses as c', 'sta.course_id', '=', 'c.id')
            ->join('users as s', 'sta.student_id', '=', 's.id')
            ->where('sta.tutor_id', $user->id)
            ->where('sta.tutor_status', 'accepted')
            ->whereNull('sta.class_id') // Only individual assignments
            ->groupBy('c.id', 'c.title', 'c.description', 'c.duration_hours')
            ->get();

        // Get accepted classes grouped by course
        $classCourses = DB::table('classes as cls')
            ->select(
                'c.id as course_id',
                'c.title as course_title',
                'c.description as course_description',
                'c.duration_hours',
                DB::raw("'class' as assignment_type"),
                DB::raw('cls.current_enrollment as student_count'),
                DB::raw('cls.title as class_title'),
                DB::raw('cls.batch_name'),
                DB::raw('cls.created_at as last_assignment_date')
            )
            ->join('courses as c', 'cls.course_id', '=', 'c.id')
            ->where('cls.tutor_id', $user->id)
            ->where('cls.tutor_status', 'accepted')
            ->get();

        // Combine and format the data
        $courses = $individualCourses->merge($classCourses)->map(function($course) {
            return [
                'course_id' => $course->course_id,
                'course_title' => $course->course_title,
                'course_description' => $course->course_description,
                'duration_hours' => $course->duration_hours,
                'assignment_type' => $course->assignment_type,
                'student_count' => $course->student_count,
                'student_names' => $course->student_names ?? null,
                'class_title' => $course->class_title ?? null,
                'batch_name' => $course->batch_name ?? null,
                'last_assignment_date' => $course->last_assignment_date,
                'has_tutorials' => false // We'll update this in next step
            ];
        });

        return response()->json([
            'success' => true,
            'courses' => $courses,
            'stats' => [
                'total_courses' => $courses->count(),
                'individual_courses' => $individualCourses->count(),
                'class_courses' => $classCourses->count(),
                'total_students' => $individualCourses->sum('student_count') + $classCourses->sum('student_count')
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('Get tutor courses error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch courses',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function createTutorial(Request $request)
{
    try {
        $user = Auth::user();
        
        // Validate the request
        $validated = $request->validate([
            // Required fields
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'course_id' => 'required|exists:courses,id',
            'level' => 'required|in:beginner,intermediate,advanced',
            
            // Content arrays (will be JSON encoded)
            'learning_objectives' => 'nullable|array',
            'learning_objectives.*' => 'nullable|string|max:500',
            'requirements' => 'nullable|array',
            'requirements.*' => 'nullable|string|max:500',
            
            // Tutor info
            'instructor_bio' => 'nullable|string',
            
            // Optional schedule fields
            'batch_name' => 'nullable|string|max:255',
            'schedule' => 'nullable|string|max:500',
            'start_date' => 'nullable|date',
            
            // Status
            'status' => 'nullable|in:draft,pending_approval',
        ]);

        // Check if tutor has access to this course
        $courseId = $validated['course_id'];
        
        $hasAssignment = DB::table('student_tutor_assignments')
            ->where('course_id', $courseId)
            ->where('tutor_id', $user->id)
            ->where('tutor_status', 'accepted')
            ->exists();
        
        $hasClass = DB::table('classes')
            ->where('course_id', $courseId)
            ->where('tutor_id', $user->id)
            ->where('tutor_status', 'accepted')
            ->exists();
        
        if (!$hasAssignment && !$hasClass) {
            return response()->json([
                'success' => false,
                'message' => 'You are not assigned to this course or need to accept the assignment first'
            ], 403);
        }

        // Get course details to inherit some fields
        $course = DB::table('courses')->find($courseId);
        
        // Prepare tutorial data - MATCHING DATABASE SCHEMA
        $tutorialData = [
            // REQUIRED FIELDS (NOT NULL in database)
            'tutor_id' => $user->id,
            'course_id' => $courseId,
            'title' => $validated['title'],
            'batch_name' => $validated['batch_name'] ?? 'Content Package',
            'enrollment_code' => 'TUT-' . $courseId . '-' . strtoupper(Str::random(6)),
            'schedule' => $validated['schedule'] ?? 'Flexible schedule',
            'start_date' => $validated['start_date'] ?? now()->addWeek()->format('Y-m-d'),
            'instructor' => $user->name,
            
            // CONTENT FIELDS
            'description' => $validated['description'],
            'level' => $validated['level'],
            
            // Inherit from course
            'price' => $course->price_group ?? 0,
            'duration_hours' => $course->duration_hours ?? 10,
            
            // Content arrays (JSON encoded for text fields)
            'learning_outcomes' => !empty($validated['learning_objectives']) 
                ? json_encode($validated['learning_objectives'])
                : json_encode(['Learn course material effectively']),
            'requirements' => !empty($validated['requirements']) 
                ? json_encode($validated['requirements'])
                : json_encode(['Basic understanding required']),
            
            // Tutor info
            'instructor_bio' => $validated['instructor_bio'] ?? '',
            
            // Optional fields with defaults
            'end_date' => null, // No end date for content package
            'max_capacity' => 0, // No capacity limit for content
            'current_enrollment' => 0,
            'image' => null,
            'content' => '', // Main content area
            'curriculum' => '', // Can be filled later
            'rating' => 0.0,
            'lessons_count' => 0,
            
            // Status
            'status' => $validated['status'] ?? 'draft',
            'is_published' => false,
        ];

        $tutorial = Tutorial::create($tutorialData);

        // Send notification to admin if submitted for approval
        if (($validated['status'] ?? 'draft') === 'pending_approval') {
            $this->sendTutorialCreatedNotification($user, $tutorial, $courseId);
        }

        return response()->json([
            'success' => true,
            'message' => ($validated['status'] ?? 'draft') === 'pending_approval' 
                ? 'Tutorial submitted for admin approval.' 
                : 'Tutorial saved as draft.',
            'tutorial' => $tutorial
        ], 201);

    } catch (\Exception $e) {
        Log::error('Create tutorial error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to create tutorial',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Submit draft tutorial for admin approval
 */
public function submitForApproval(Request $request, $tutorialId)
{
    try {
        $user = Auth::user();
        
        $tutorial = Tutorial::where('id', $tutorialId)
            ->where('tutor_id', $user->id)
            ->firstOrFail();
        
        // Check if tutorial is in draft status
        if ($tutorial->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Only draft tutorials can be submitted for approval'
            ], 422);
        }
        
        // Update status
        $tutorial->update([
            'status' => 'pending_approval',
            'updated_at' => now()
        ]);
        
        // Send notification to admin
        $this->sendTutorialCreatedNotification($user, $tutorial, $tutorial->course_id);
        
        return response()->json([
            'success' => true,
            'message' => 'Tutorial submitted for admin approval',
            'tutorial' => $tutorial
        ]);
        
    } catch (\Exception $e) {
        Log::error('Submit for approval error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to submit tutorial for approval',
            'error' => $e->getMessage()
        ], 500);
    }
}

private function sendTutorialCreatedNotification($tutor, $tutorial, $courseId)
{
    try {
        $course = DB::table('courses')->find($courseId);
        $adminUsers = User::where('role', 'admin')->get();
        
        foreach ($adminUsers as $admin) {
            DB::table('messages')->insert([
                'sender_id' => $tutor->id,
                'receiver_id' => $admin->id,
                'message' => "📚 New Tutorial Created\nCourse: {$course->title}\nTutorial: {$tutorial->title}\nTutor: {$tutor->name}\n\nPlease review and approve this tutorial.",
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    } catch (\Exception $e) {
        Log::error('Send tutorial notification error: ' . $e->getMessage());
    }
}

    // Get students for tutor
    public function getStudents()
    {
        try {
            $user = Auth::user();
            $tutorials = Tutorial::where('tutor_id', $user->id)->get();

            $students = User::where('role', 'student')
                ->whereHas('enrollments', function($query) use ($tutorials) {
                    $query->whereIn('tutorial_id', $tutorials->pluck('id'));
                })
                ->with(['enrollments.tutorial'])
                ->get()
                ->map(function($student) {
                    $latestEnrollment = $student->enrollments->sortByDesc('created_at')->first();
                    return [
                        'id' => $student->id,
                        'name' => $student->name,
                        'email' => $student->email,
                        'tutorial_id' => $latestEnrollment->tutorial_id ?? null,
                        'tutorial_title' => $latestEnrollment->tutorial->title ?? 'N/A',
                        'enrollment_date' => $latestEnrollment->created_at ?? $student->created_at,
                        'progress_percentage' => 0,
                        'last_accessed' => $student->updated_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'students' => $students
            ]);

        } catch (\Exception $e) {
            Log::error('Get students error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch students',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Other methods can be implemented similarly...
    public function getPayments()
    {
        // Implement payment retrieval
        return response()->json([
            'success' => true,
            'payments' => []
        ]);
    }

    public function getSchedule()
    {
        // Implement schedule retrieval
        return response()->json([
            'success' => true,
            'schedule' => []
        ]);
    }

    // Add these methods to TutorController
public function publishTutorial(Tutorial $tutorial)
{
    try {
        $user = Auth::user();
        
        // Check if tutorial belongs to this tutor
        if ($tutorial->tutor_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $tutorial->update(['is_published' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Tutorial published successfully'
        ]);

    } catch (\Exception $e) {
        Log::error('Publish tutorial error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to publish tutorial'
        ], 500);
    }
}

public function unpublishTutorial(Tutorial $tutorial)
{
    try {
        $user = Auth::user();
        
        // Check if tutorial belongs to this tutor
        if ($tutorial->tutor_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $tutorial->update(['is_published' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Tutorial unpublished successfully'
        ]);

    } catch (\Exception $e) {
        Log::error('Unpublish tutorial error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to unpublish tutorial'
        ], 500);
    }
}

// Add these methods to your TutorController class

/**
 * Get detailed attendance for a specific session
 */
public function getSessionAttendance($sessionId)
{
    try {
        $user = Auth::user();
        $session = TutorialSession::with('tutorial')->findOrFail($sessionId);

        // Check if the session belongs to this tutor
        if ($session->tutor_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view attendance for this session'
            ], 403);
        }

        // Get enrolled students
        $enrolledStudents = Enrollment::where('tutorial_id', $session->tutorial_id)
            ->with('user')
            ->get();

        // Get existing attendance records
        $existingAttendance = Attendance::where('tutorial_session_id', $sessionId)
            ->with('user')
            ->get()
            ->keyBy('user_id');

        // Combine enrolled students with their attendance status
        $attendanceData = $enrolledStudents->map(function($enrollment) use ($existingAttendance, $session) {
            $attendance = $existingAttendance->get($enrollment->user_id);
            
            return [
                'student_id' => $enrollment->user_id,
                'student_name' => $enrollment->user->name,
                'student_email' => $enrollment->user->email,
                'status' => $attendance ? $attendance->status : 'absent',
                'duration_minutes' => $attendance ? $attendance->duration_minutes : 0,
                'notes' => $attendance ? $attendance->instructor_notes : null,
                'attendance_id' => $attendance ? $attendance->id : null,
                'marked_at' => $attendance ? $attendance->created_at : null,
            ];
        });

        return response()->json([
            'success' => true,
            'attendance' => $attendanceData,
            'session' => [
                'id' => $session->id,
                'title' => $session->title,
                'tutorial_title' => $session->tutorial->title,
                'start_time' => $session->start_time,
                'end_time' => $session->end_time,
                'status' => $session->status,
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('Get session attendance error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch session attendance',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Update individual attendance record
 */
public function updateAttendance(Request $request, $attendanceId)
{
    try {
        $user = Auth::user();
        $attendance = Attendance::with('tutorialSession')->findOrFail($attendanceId);

        // Check if the attendance record belongs to this tutor's session
        if ($attendance->tutorialSession->tutor_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this attendance record'
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:present,absent,late,excused',
            'duration_minutes' => 'nullable|integer|min:0',
            'instructor_notes' => 'nullable|string|max:500'
        ]);

        $attendance->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Attendance updated successfully',
            'attendance' => $attendance->load('user')
        ]);

    } catch (\Exception $e) {
        Log::error('Update attendance error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to update attendance',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Bulk mark attendance for a session
 */
public function bulkMarkAttendance(Request $request, $sessionId)
{
    try {
        $user = Auth::user();
        $session = TutorialSession::findOrFail($sessionId);

        // Check if the session belongs to this tutor
        if ($session->tutor_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to mark attendance for this session'
            ], 403);
        }

        $attendanceData = $request->validate([
            'attendance' => 'required|array',
            'attendance.*.student_id' => 'required|exists:users,id',
            'attendance.*.status' => 'required|in:present,absent,late,excused',
            'attendance.*.duration_minutes' => 'nullable|integer|min:0',
            'attendance.*.notes' => 'nullable|string|max:500'
        ]);

        $results = [];
        
        foreach ($attendanceData['attendance'] as $studentAttendance) {
            // Verify student is enrolled in this tutorial
            $isEnrolled = Enrollment::where('tutorial_id', $session->tutorial_id)
                ->where('user_id', $studentAttendance['student_id'])
                ->exists();

            if (!$isEnrolled) {
                $results[] = [
                    'student_id' => $studentAttendance['student_id'],
                    'success' => false,
                    'message' => 'Student not enrolled in this tutorial'
                ];
                continue;
            }

            try {
                $attendance = Attendance::updateOrCreate(
                    [
                        'user_id' => $studentAttendance['student_id'],
                        'tutorial_session_id' => $sessionId,
                    ],
                    [
                        'tutorial_id' => $session->tutorial_id,
                        'session_date' => $session->start_time,
                        'status' => $studentAttendance['status'],
                        'duration_minutes' => $studentAttendance['duration_minutes'] ?? $session->duration_minutes,
                        'instructor_notes' => $studentAttendance['notes'] ?? null,
                        'session_type' => $session->session_type,
                    ]
                );

                $results[] = [
                    'student_id' => $studentAttendance['student_id'],
                    'success' => true,
                    'attendance_id' => $attendance->id,
                    'message' => 'Attendance marked successfully'
                ];

            } catch (\Exception $e) {
                $results[] = [
                    'student_id' => $studentAttendance['student_id'],
                    'success' => false,
                    'message' => 'Failed to mark attendance: ' . $e->getMessage()
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Bulk attendance marking completed',
            'results' => $results
        ]);

    } catch (\Exception $e) {
        Log::error('Bulk mark attendance error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to mark bulk attendance',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get attendance report for a tutorial
 */
public function getTutorialAttendanceReport($tutorialId)
{
    try {
        $user = Auth::user();
        $tutorial = Tutorial::findOrFail($tutorialId);

        // Check if tutorial belongs to this tutor
        if ($tutorial->tutor_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view attendance for this tutorial'
            ], 403);
        }

        // Get all sessions for this tutorial
        $sessions = TutorialSession::where('tutorial_id', $tutorialId)
            ->orderBy('start_time', 'asc')
            ->get();

        // Get all enrolled students
        $enrolledStudents = Enrollment::where('tutorial_id', $tutorialId)
            ->with('user')
            ->get();

        // Get all attendance records for this tutorial
        $attendanceRecords = Attendance::where('tutorial_id', $tutorialId)
            ->with(['user', 'tutorialSession'])
            ->get()
            ->groupBy('user_id');

        // Build report data
        $reportData = $enrolledStudents->map(function($enrollment) use ($sessions, $attendanceRecords) {
            $studentAttendance = $attendanceRecords->get($enrollment->user_id, collect());
            $attendanceBySession = $studentAttendance->keyBy('tutorial_session_id');

            $sessionAttendance = $sessions->map(function($session) use ($attendanceBySession) {
                $attendance = $attendanceBySession->get($session->id);
                return [
                    'session_id' => $session->id,
                    'session_title' => $session->title,
                    'session_date' => $session->start_time,
                    'status' => $attendance ? $attendance->status : 'absent',
                    'duration_minutes' => $attendance ? $attendance->duration_minutes : 0,
                ];
            });

            $presentCount = $sessionAttendance->where('status', 'present')->count();
            $lateCount = $sessionAttendance->where('status', 'late')->count();
            $absentCount = $sessionAttendance->where('status', 'absent')->count();
            $excusedCount = $sessionAttendance->where('status', 'excused')->count();
            $totalSessions = $sessions->count();

            $attendanceRate = $totalSessions > 0 ? 
                round((($presentCount + $lateCount) / $totalSessions) * 100, 2) : 0;

            return [
                'student_id' => $enrollment->user_id,
                'student_name' => $enrollment->user->name,
                'student_email' => $enrollment->user->email,
                'enrollment_date' => $enrollment->created_at,
                'total_sessions' => $totalSessions,
                'present_count' => $presentCount,
                'late_count' => $lateCount,
                'absent_count' => $absentCount,
                'excused_count' => $excusedCount,
                'attendance_rate' => $attendanceRate,
                'session_attendance' => $sessionAttendance,
            ];
        });

        return response()->json([
            'success' => true,
            'report' => [
                'tutorial' => [
                    'id' => $tutorial->id,
                    'title' => $tutorial->title,
                    'total_sessions' => $sessions->count(),
                    'total_students' => $enrolledStudents->count(),
                ],
                'students' => $reportData,
                'sessions' => $sessions->map(function($session) {
                    return [
                        'id' => $session->id,
                        'title' => $session->title,
                        'date' => $session->start_time,
                        'status' => $session->status,
                    ];
                }),
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('Get tutorial attendance report error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to generate attendance report',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get student's attendance history
 */
public function getStudentAttendance($studentId)
{
    try {
        $user = Auth::user();

        // Verify student exists
        $student = User::where('role', 'student')->findOrFail($studentId);

        // Get tutorials where this tutor teaches and student is enrolled
        $tutorials = Tutorial::where('tutor_id', $user->id)
            ->whereHas('enrollments', function($query) use ($studentId) {
                $query->where('user_id', $studentId);
            })
            ->with(['sessions', 'enrollments' => function($query) use ($studentId) {
                $query->where('user_id', $studentId);
            }])
            ->get();

        $attendanceHistory = [];

        foreach ($tutorials as $tutorial) {
            $sessions = $tutorial->sessions;
            $attendanceRecords = Attendance::where('user_id', $studentId)
                ->where('tutorial_id', $tutorial->id)
                ->with('tutorialSession')
                ->get()
                ->keyBy('tutorial_session_id');

            $tutorialAttendance = $sessions->map(function($session) use ($attendanceRecords) {
                $attendance = $attendanceRecords->get($session->id);
                return [
                    'session_id' => $session->id,
                    'session_title' => $session->title,
                    'session_date' => $session->start_time,
                    'status' => $attendance ? $attendance->status : 'absent',
                    'duration_minutes' => $attendance ? $attendance->duration_minutes : 0,
                    'notes' => $attendance ? $attendance->instructor_notes : null,
                ];
            });

            $presentCount = $tutorialAttendance->where('status', 'present')->count();
            $totalSessions = $sessions->count();
            $attendanceRate = $totalSessions > 0 ? 
                round(($presentCount / $totalSessions) * 100, 2) : 0;

            $attendanceHistory[] = [
                'tutorial_id' => $tutorial->id,
                'tutorial_title' => $tutorial->title,
                'enrollment_date' => $tutorial->enrollments->first()->created_at,
                'total_sessions' => $totalSessions,
                'attended_sessions' => $presentCount,
                'attendance_rate' => $attendanceRate,
                'sessions' => $tutorialAttendance,
            ];
        }

        return response()->json([
            'success' => true,
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
            ],
            'attendance_history' => $attendanceHistory
        ]);

    } catch (\Exception $e) {
        Log::error('Get student attendance error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch student attendance history',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get assigned tutorials (accepted assignments)
 */
public function getAssignedTutorials(Request $request)
{
    $user = Auth::user();
    
    $tutorials = $user->assignedTutorials()
        ->wherePivot('status', 'accepted')
        ->with(['category', 'lessons'])
        ->orderBy('created_at', 'desc')
        ->get();
    
    return response()->json([
        'success' => true,
        'tutorials' => $tutorials
    ]);
}

/**
 * Get tutorial creation statistics
 */
public function getTutorialStats(Request $request)
{
    $user = Auth::user();
    
    $stats = [
        'total_created' => $user->createdTutorials()->count(),
        'total_assigned' => $user->assignedTutorials()->count(),
        'pending_assignments' => $user->tutorialAssignments()->where('status', 'pending')->count(),
        'published_tutorials' => $user->createdTutorials()->where('status', 'published')->count(),
        'pending_approval' => $user->createdTutorials()->where('status', 'pending_approval')->count(),
    ];
    
    return response()->json([
        'success' => true,
        'stats' => $stats
    ]);
}

/**
 * Get pending assignments for current tutor
 */
public function getPendingAssignments(Request $request)
{
    $user = Auth::user();
    
    $assignments = TutorialAssignment::with(['tutorial', 'tutorial.category', 'assignedBy'])
        ->where('tutor_id', $user->id)
        ->where('status', 'pending')
        ->orderBy('created_at', 'desc')
        ->get();
    
    return response()->json([
        'success' => true,
        'assignments' => $assignments
    ]);
}

/**
 * Submit tutorial for admin review (when tutor completes content)
 */
public function submitForReview(Request $request, $tutorialId)
{
    $user = Auth::user();
    
    $tutorial = Tutorial::where('id', $tutorialId)
        ->where('tutor_id', $user->id)
        ->firstOrFail();
    
    // Check if tutorial is in progress
    if ($tutorial->status !== 'in_progress') {
        return response()->json([
            'success' => false,
            'message' => 'Tutorial must be in progress to submit for review'
        ], 422);
    }
    
    $tutorial->update([
        'status' => 'pending_review'
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Tutorial submitted for admin review',
        'tutorial' => $tutorial
    ]);
}

/**
 * Mark tutorial as completed (for assigned tutorials)
 */
public function markAsCompleted(Request $request, $tutorialId)
{
    $user = Auth::user();
    
    $tutorial = Tutorial::where('id', $tutorialId)
        ->where('tutor_id', $user->id)
        ->firstOrFail();
    
    // Check if tutorial is assigned to this tutor
    $assignment = TutorialAssignment::where('tutorial_id', $tutorialId)
        ->where('tutor_id', $user->id)
        ->where('status', 'accepted')
        ->first();
    
    if (!$assignment) {
        return response()->json([
            'success' => false,
            'message' => 'You are not assigned to this tutorial'
        ], 403);
    }
    
    $tutorial->update([
        'status' => 'completed'
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Tutorial marked as completed',
        'tutorial' => $tutorial
    ]);
}

// In TutorController.php - MODIFIED METHODS

/**
 * Get all assignments and classes for current tutor
 * Returns: Individual assignments + Classes grouped by status
 */
public function getAssignments(Request $request)
{
    try {
        $user = Auth::user();
        
        // Get individual assignments
        $individualAssignments = DB::table('student_tutor_assignments as sta')
            ->select(
                'sta.id',
                DB::raw("'individual' as type"),
                'sta.status',
                'sta.tutor_status',
                'sta.weekly_hours',
                'sta.start_date',
                'sta.end_date',
                'sta.tutor_responded_at',
                'sta.rejection_reason',
                'sta.created_at',
                'sta.updated_at',
                
                // Student info
                's.id as student_id',
                's.name as student_name',
                's.email as student_email',
                's.profile_photo as student_avatar',
                
                // Course info
                'c.id as course_id',
                'c.title as course_title',
                'c.description as course_description',
                'c.duration_hours as course_duration'
            )
            ->join('users as s', 'sta.student_id', '=', 's.id')
            ->join('courses as c', 'sta.course_id', '=', 'c.id')
            ->where('sta.tutor_id', $user->id)
            ->orderBy('sta.created_at', 'desc')
            ->get();

        // Get classes
        $classes = DB::table('classes as cls')
            ->select(
                'cls.id',
                DB::raw("'class' as type"),
                'cls.status',
                'cls.tutor_status',
                'cls.title',
                'cls.description',
                'cls.batch_name',
                'cls.enrollment_code',
                'cls.current_enrollment',
                'cls.max_capacity',
                'cls.schedule',
                'cls.start_date',
                'cls.end_date',
                'cls.price',
                'cls.level',
                'cls.tutor_responded_at',
                'cls.rejection_reason',
                'cls.created_at',
                'cls.updated_at',
                
                // Course info
                'c.id as course_id',
                'c.title as course_title',
                'c.description as course_description',
                'c.duration_hours as course_duration'
            )
            ->join('courses as c', 'cls.course_id', '=', 'c.id')
            ->where('cls.tutor_id', $user->id)
            ->orderBy('cls.created_at', 'desc')
            ->get();

        // Group by status for frontend
        $grouped = [
            'pending' => [
                'individual' => $individualAssignments->where('tutor_status', 'pending')->values(),
                'classes' => $classes->where('tutor_status', 'pending')->values(),
                'count' => $individualAssignments->where('tutor_status', 'pending')->count() + 
                          $classes->where('tutor_status', 'pending')->count()
            ],
            'accepted' => [
                'individual' => $individualAssignments->where('tutor_status', 'accepted')->values(),
                'classes' => $classes->where('tutor_status', 'accepted')->values(),
                'count' => $individualAssignments->where('tutor_status', 'accepted')->count() + 
                          $classes->where('tutor_status', 'accepted')->count()
            ],
            'rejected' => [
                'individual' => $individualAssignments->where('tutor_status', 'rejected')->values(),
                'classes' => $classes->where('tutor_status', 'rejected')->values(),
                'count' => $individualAssignments->where('tutor_status', 'rejected')->count() + 
                          $classes->where('tutor_status', 'rejected')->count()
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $grouped,
            'stats' => [
                'total_individual' => $individualAssignments->count(),
                'total_classes' => $classes->count(),
                'total_pending' => $grouped['pending']['count'],
                'total_accepted' => $grouped['accepted']['count'],
                'total_rejected' => $grouped['rejected']['count']
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('Get assignments error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch assignments',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Accept an assignment or class
 * Route: POST /tutor/assignments/{id}/accept?type=individual|class
 */
public function acceptAssignment(Request $request, $id)
{
    try {
        $user = Auth::user();
        $type = $request->query('type', 'individual');
        
        if ($type === 'individual') {
            // Accept individual assignment
            $updated = DB::table('student_tutor_assignments')
                ->where('id', $id)
                ->where('tutor_id', $user->id)
                ->where('tutor_status', 'pending')
                ->update([
                    'tutor_status' => 'accepted',
                    'tutor_responded_at' => now(),
                    'status' => 'active',
                    'updated_at' => now()
                ]);
                
            $assignment = DB::table('student_tutor_assignments as sta')
                ->join('users as s', 'sta.student_id', '=', 's.id')
                ->join('courses as c', 'sta.course_id', '=', 'c.id')
                ->where('sta.id', $id)
                ->first(['sta.*', 's.name as student_name', 'c.title as course_title']);
                
            $itemType = 'assignment';
            
        } else if ($type === 'class') {
            // Accept class
            $updated = DB::table('classes')
                ->where('id', $id)
                ->where('tutor_id', $user->id)
                ->where('tutor_status', 'pending')
                ->update([
                    'tutor_status' => 'accepted',
                    'tutor_responded_at' => now(),
                    'status' => 'upcoming',
                    'updated_at' => now()
                ]);
                
            $assignment = DB::table('classes as cls')
                ->join('courses as c', 'cls.course_id', '=', 'c.id')
                ->where('cls.id', $id)
                ->first(['cls.*', 'c.title as course_title']);
                
            $itemType = 'class';
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Invalid type. Use individual or class'
            ], 400);
        }

        if (!$updated) {
            return response()->json([
                'success' => false,
                'message' => ucfirst($itemType) . ' not found or already processed'
            ], 404);
        }

        // Send notification to admin
        $this->sendAcceptanceNotification($user, $assignment, $itemType);

        return response()->json([
            'success' => true,
            'message' => ucfirst($itemType) . ' accepted successfully',
            'data' => $assignment
        ]);

    } catch (\Exception $e) {
        Log::error('Accept assignment error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to accept assignment',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Reject an assignment or class with reason
 * Route: POST /tutor/assignments/{id}/reject?type=individual|class
 */
public function rejectAssignment(Request $request, $id)
{
    try {
        $user = Auth::user();
        $type = $request->query('type', 'individual');
        $reason = $request->input('reason', '');
        
        if (empty($reason)) {
            return response()->json([
                'success' => false,
                'message' => 'Rejection reason is required'
            ], 422);
        }

        if ($type === 'individual') {
            $updated = DB::table('student_tutor_assignments')
                ->where('id', $id)
                ->where('tutor_id', $user->id)
                ->where('tutor_status', 'pending')
                ->update([
                    'tutor_status' => 'rejected',
                    'tutor_responded_at' => now(),
                    'rejection_reason' => $reason,
                    'status' => 'cancelled',
                    'updated_at' => now()
                ]);
                
            $assignment = DB::table('student_tutor_assignments as sta')
                ->join('users as s', 'sta.student_id', '=', 's.id')
                ->join('courses as c', 'sta.course_id', '=', 'c.id')
                ->where('sta.id', $id)
                ->first(['sta.*', 's.name as student_name', 'c.title as course_title']);
                
            $itemType = 'assignment';
            
        } else if ($type === 'class') {
            $updated = DB::table('classes')
                ->where('id', $id)
                ->where('tutor_id', $user->id)
                ->where('tutor_status', 'pending')
                ->update([
                    'tutor_status' => 'rejected',
                    'tutor_responded_at' => now(),
                    'rejection_reason' => $reason,
                    'status' => 'cancelled',
                    'updated_at' => now()
                ]);
                
            $assignment = DB::table('classes as cls')
                ->join('courses as c', 'cls.course_id', '=', 'c.id')
                ->where('cls.id', $id)
                ->first(['cls.*', 'c.title as course_title']);
                
            $itemType = 'class';
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Invalid type. Use individual or class'
            ], 400);
        }

        if (!$updated) {
            return response()->json([
                'success' => false,
                'message' => ucfirst($itemType) . ' not found or already processed'
            ], 404);
        }

        // Send notification to admin
        $this->sendRejectionNotification($user, $assignment, $itemType, $reason);

        return response()->json([
            'success' => true,
            'message' => ucfirst($itemType) . ' rejected successfully',
            'data' => $assignment
        ]);

    } catch (\Exception $e) {
        Log::error('Reject assignment error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to reject assignment',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Send notification to admin when tutor accepts
 */
private function sendAcceptanceNotification($tutor, $assignment, $type)
{
    try {
        $adminUsers = User::where('role', 'admin')->get();
        
        foreach ($adminUsers as $admin) {
            DB::table('messages')->insert([
                'sender_id' => $tutor->id,
                'receiver_id' => $admin->id,
                'message' => $type === 'assignment' 
                    ? "I have accepted the assignment for {$assignment->course_title} with student {$assignment->student_name}."
                    : "I have accepted the class assignment for {$assignment->course_title} ({$assignment->title}).",
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    } catch (\Exception $e) {
        Log::error('Send acceptance notification error: ' . $e->getMessage());
    }
}

/**
 * Send notification to admin when tutor rejects
 */
private function sendRejectionNotification($tutor, $assignment, $type, $reason)
{
    try {
        $adminUsers = User::where('role', 'admin')->get();
        
        foreach ($adminUsers as $admin) {
            DB::table('messages')->insert([
                'sender_id' => $tutor->id,
                'receiver_id' => $admin->id,
                'message' => $type === 'assignment'
                    ? "I have rejected the assignment for {$assignment->course_title} with student {$assignment->student_name}. Reason: {$reason}"
                    : "I have rejected the class assignment for {$assignment->course_title} ({$assignment->title}). Reason: {$reason}",
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    } catch (\Exception $e) {
        Log::error('Send rejection notification error: ' . $e->getMessage());
    }
}

/**
 * List all lessons for a specific tutorial
 * GET /tutor/tutorials/{tutorialId}/lessons
 */
public function getLessons($tutorialId)
{
    try {
        $user = Auth::user();
        
        // Find tutorial owned by this tutor
        $tutorial = Tutorial::where('id', $tutorialId)
            ->where('tutor_id', $user->id)
            ->firstOrFail();

        $lessons = $tutorial->lessons()
            ->orderBy('order')
            ->with('materials') // if you add materials table later
            ->get()
            ->map(function ($lesson) {
                return [
                    'id'           => $lesson->id,
                    'title'        => $lesson->title,
                    'description'  => $lesson->description,
                    'duration'     => $lesson->duration,
                    'order'        => $lesson->order,
                    'video_url'    => $lesson->video_url,
                    'content'      => $lesson->content, // rich text/markdown
                    'is_preview'   => $lesson->is_preview,
                    'is_locked'    => $lesson->is_locked,
                    'materials'    => $lesson->materials->map(fn($m) => [
                        'id'           => $m->id,
                        'original_name'=> $m->original_name,
                        'url'          => Storage::url($m->file_path),
                        'mime_type'    => $m->mime_type,
                        'size_kb'      => $m->size_kb,
                    ]) ?? [],
                    'created_at'   => $lesson->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'lessons' => $lessons,
            'tutorial' => [
                'id'    => $tutorial->id,
                'title' => $tutorial->title,
                'status'=> $tutorial->status,
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('Get lessons error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch lessons',
            'error'   => $e->getMessage()
        ], 500);
    }
}

/**
 * Create a new lesson
 * POST /tutor/tutorials/{tutorialId}/lessons
 */
public function createLesson(Request $request, $tutorialId)
{
    try {
        $user = Auth::user();
        
        $tutorial = Tutorial::where('id', $tutorialId)
            ->where('tutor_id', $user->id)
            ->firstOrFail();

        // Allow creation only if tutorial is editable
        if (!in_array($tutorial->status, ['draft', 'rejected', 'approved', 'in_progress'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot add lessons to this tutorial status'
            ], 403);
        }

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration'    => 'required|string|max:100', // e.g. "45 min"
            'order'       => 'required|integer|min:1',
            'video_url'   => 'nullable|url',
            'content'     => 'nullable|string', // markdown or rich text
            'is_preview'  => 'boolean',
            'is_locked'   => 'boolean',
            'materials.*' => 'nullable|file|mimes:pdf,doc,docx,txt,zip|max:15360', // 15MB max
        ]);

        $lesson = $tutorial->lessons()->create($validated);

        // Handle multiple file uploads
        if ($request->hasFile('materials')) {
            foreach ($request->file('materials') as $file) {
                $path = $file->store('lessons/' . $lesson->id, 'public');
                
                $lesson->materials()->create([
                    'file_path'     => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type'     => $file->getMimeType(),
                    'size_kb'       => round($file->getSize() / 1024, 2),
                ]);
            }
        }

        $lesson->load('materials');

        return response()->json([
            'success' => true,
            'message' => 'Lesson created successfully',
            'lesson'  => [
                'id'           => $lesson->id,
                'title'        => $lesson->title,
                'description'  => $lesson->description,
                'duration'     => $lesson->duration,
                'order'        => $lesson->order,
                'video_url'    => $lesson->video_url,
                'content'      => $lesson->content,
                'is_preview'   => $lesson->is_preview,
                'is_locked'    => $lesson->is_locked,
                'materials'    => $lesson->materials->map(fn($m) => [
                    'id'           => $m->id,
                    'original_name'=> $m->original_name,
                    'url'          => Storage::url($m->file_path),
                ]),
            ]
        ], 201);

    } catch (\Exception $e) {
        Log::error('Create lesson error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to create lesson',
            'error'   => $e->getMessage()
        ], 500);
    }
}

/**
 * Update a lesson
 * PUT /tutor/tutorials/{tutorialId}/lessons/{lessonId}
 */
public function updateLesson(Request $request, $tutorialId, $lessonId)
{
    try {
        $user = Auth::user();

        $tutorial = Tutorial::where('id', $tutorialId)
            ->where('tutor_id', $user->id)
            ->firstOrFail();

        $lesson = $tutorial->lessons()->findOrFail($lessonId);

        Log::info('Update lesson request received', [
            'tutorial_id' => $tutorialId,
            'lesson_id'   => $lessonId,
            'input'       => $request->all(),
            'files'       => $request->hasFile('materials') ? count($request->file('materials')) : 0,
        ]);

        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'duration'    => 'sometimes|string|max:100',
            'order'       => 'sometimes|integer|min:1',
            'video_url'   => 'nullable|url',
            'content'     => 'nullable|string',
            'is_preview'  => 'sometimes|boolean',
            'is_locked'   => 'sometimes|boolean',
            'materials.*' => 'nullable|file|mimes:pdf,doc,docx,txt,zip|max:15360',
        ]);

        // Update only the fields that were sent
        $updateData = array_filter($validated, fn($v) => !is_null($v) && $v !== '');

        // Special handling for booleans (they come as "1"/"0" or true/false)
        if (array_key_exists('is_preview', $request->all())) {
            $updateData['is_preview'] = $request->boolean('is_preview');
        }
        if (array_key_exists('is_locked', $request->all())) {
            $updateData['is_locked'] = $request->boolean('is_locked');
        }

        $lesson->update($updateData);

        // Handle new materials (append only)
        if ($request->hasFile('materials')) {
            foreach ($request->file('materials') as $file) {
                $path = $file->store('lessons/' . $lesson->id, 'public');
                $lesson->materials()->create([
                    'file_path'     => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type'     => $file->getMimeType(),
                    'size_kb'       => round($file->getSize() / 1024, 2),
                ]);
            }
        }

        $lesson->load('materials');

        Log::info('Lesson updated successfully', ['lesson_id' => $lesson->id]);

        return response()->json([
            'success' => true,
            'message' => 'Lesson updated successfully',
            'lesson'  => $lesson
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::warning('Validation failed on lesson update', $e->errors());
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors'  => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        Log::error('Lesson update failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
        return response()->json([
            'success' => false,
            'message' => 'Failed to update lesson',
            'error'   => $e->getMessage()
        ], 500);
    }
}

/**
 * Delete a lesson
 * DELETE /tutor/tutorials/{tutorialId}/lessons/{lessonId}
 */
public function deleteLesson($tutorialId, $lessonId)
{
    try {
        $user = Auth::user();
        
        $tutorial = Tutorial::where('id', $tutorialId)
            ->where('tutor_id', $user->id)
            ->firstOrFail();

        $lesson = $tutorial->lessons()->findOrFail($lessonId);

        // Delete associated files from storage
        foreach ($lesson->materials as $material) {
            if (Storage::disk('public')->exists($material->file_path)) {
                Storage::disk('public')->delete($material->file_path);
            }
            $material->delete();
        }

        $lesson->delete();

        // Reorder remaining lessons
        $remaining = $tutorial->lessons()->orderBy('order')->get();
        foreach ($remaining as $index => $l) {
            $l->update(['order' => $index + 1]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lesson deleted successfully'
        ]);

    } catch (\Exception $e) {
        Log::error('Delete lesson error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete lesson',
            'error'   => $e->getMessage()
        ], 500);
    }
}

/**
 * Get all live sessions for tutor
 * GET /tutor/live-sessions
 */
public function getLiveSessions(Request $request)
{
    try {
        $user = Auth::user();
        
        $status = $request->query('status');
        $tutorialId = $request->query('tutorial_id');
        
        $query = LiveSession::with(['tutorial', 'course'])
            ->where('tutor_id', $user->id)
            ->orderBy('start_time', 'desc');
            
        if ($status) {
            $query->where('status', $status);
        }
        
        if ($tutorialId) {
            $query->where('tutorial_id', $tutorialId);
        }
        
        $sessions = $query->get();
        
        return response()->json([
            'success' => true,
            'sessions' => $sessions,
            'stats' => [
                'total' => $sessions->count(),
                'scheduled' => $sessions->where('status', 'scheduled')->count(),
                'live' => $sessions->where('status', 'live')->count(),
                'ended' => $sessions->where('status', 'ended')->count(),
                'cancelled' => $sessions->where('status', 'cancelled')->count(),
            ]
        ]);
        
    } catch (\Exception $e) {
        Log::error('Get live sessions error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch live sessions',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get live sessions for a specific tutorial
 * GET /tutor/tutorials/{tutorialId}/live-sessions
 */
public function getTutorialLiveSessions($tutorialId)
{
    try {
        $user = Auth::user();
        
        $tutorial = Tutorial::where('id', $tutorialId)
            ->where('tutor_id', $user->id)
            ->firstOrFail();
        
        $sessions = LiveSession::where('tutorial_id', $tutorialId)
            ->orderBy('start_time', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'sessions' => $sessions,
            'tutorial' => [
                'id' => $tutorial->id,
                'title' => $tutorial->title,
            ]
        ]);
        
    } catch (\Exception $e) {
        Log::error('Get tutorial live sessions error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch live sessions for tutorial',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Create a new live session
 * POST /tutor/live-sessions
 */
public function createLiveSession(Request $request)
{
    try {
        $user = Auth::user();
        
        $validated = $request->validate([
            'tutorial_id' => 'required|exists:tutorials,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date|after_or_equal:now',
            'duration_minutes' => 'required|integer|min:15|max:240',
            'max_participants' => 'nullable|integer|min:1|max:100',
            'lesson_id' => 'nullable|exists:lessons,id',
            'course_id' => 'nullable|exists:courses,id',
        ]);
        
        // Verify tutorial belongs to this tutor
        $tutorial = Tutorial::where('id', $validated['tutorial_id'])
            ->where('tutor_id', $user->id)
            ->first();
            
        if (!$tutorial) {
            return response()->json([
                'success' => false,
                'message' => 'Tutorial not found or unauthorized'
            ], 403);
        }
        
        // Generate unique Jitsi room name
        $roomName = 'tut-' . $tutorial->id . '-' . Str::random(8) . '-' . time();
        $jitsiDomain = config('services.jitsi.domain', 'meet.jit.si');
        $meetingUrl = "https://{$jitsiDomain}/{$roomName}";
        
        // Create the live session
        $liveSession = LiveSession::create([
            'tutor_id' => $user->id,
            'tutorial_id' => $validated['tutorial_id'],
            'course_id' => $validated['course_id'] ?? $tutorial->course_id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'start_time' => $validated['start_time'],
            'duration_minutes' => $validated['duration_minutes'],
            'jitsi_room_name' => $roomName,
            'meeting_url' => $meetingUrl,
            'max_participants' => $validated['max_participants'] ?? 50,
            'lesson_id' => $validated['lesson_id'] ?? null,
            'status' => 'scheduled',
        ]);
        
        // Load relationships for response
        $liveSession->load(['tutorial', 'course']);
        
        return response()->json([
            'success' => true,
            'message' => 'Live session created successfully',
            'session' => $liveSession
        ], 201);
        
    } catch (\Exception $e) {
        Log::error('Create live session error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to create live session',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Update a live session
 * PUT /tutor/live-sessions/{id}
 */
public function updateLiveSession(Request $request, $id)
{
    try {
        $user = Auth::user();
        
        $liveSession = LiveSession::where('id', $id)
            ->where('tutor_id', $user->id)
            ->firstOrFail();
            
        // Only allow updates for scheduled sessions
        if ($liveSession->status !== 'scheduled') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot update a session that is already live or ended'
            ], 422);
        }
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'sometimes|date|after_or_equal:now',
            'duration_minutes' => 'sometimes|integer|min:15|max:240',
            'max_participants' => 'nullable|integer|min:1|max:100',
            'lesson_id' => 'nullable|exists:lessons,id',
        ]);
        
        // Update the session
        $liveSession->update($validated);
        $liveSession->load(['tutorial', 'course']);
        
        return response()->json([
            'success' => true,
            'message' => 'Live session updated successfully',
            'session' => $liveSession
        ]);
        
    } catch (\Exception $e) {
        Log::error('Update live session error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to update live session',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Start a live session (change status to live)
 * POST /tutor/live-sessions/{id}/start
 */
public function startLiveSession($id)
{
    try {
        $user = Auth::user();
        
        $liveSession = LiveSession::where('id', $id)
            ->where('tutor_id', $user->id)
            ->firstOrFail();
            
        // Check if session is scheduled
        if ($liveSession->status !== 'scheduled') {
            return response()->json([
                'success' => false,
                'message' => 'Only scheduled sessions can be started'
            ], 422);
        }
        
        // Check if start time is within reasonable window (e.g., 30 minutes before to 1 hour after)
        $now = Carbon::now();
        $startTime = Carbon::parse($liveSession->start_time);
        
        if ($now->diffInMinutes($startTime, false) > 30) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot start session more than 30 minutes before scheduled time'
            ], 422);
        }
        
        // Update status to live
        $liveSession->update([
            'status' => 'live',
            'actual_start_time' => $now,
        ]);
        
        // Notify enrolled students (you can implement this)
        $this->notifyStudentsAboutLiveSession($liveSession);
        
        return response()->json([
            'success' => true,
            'message' => 'Live session started successfully',
            'session' => $liveSession->load(['tutorial', 'course'])
        ]);
        
    } catch (\Exception $e) {
        Log::error('Start live session error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to start live session',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * End a live session
 * POST /tutor/live-sessions/{id}/end
 */
public function endLiveSession(Request $request, $id)
{
    try {
        $user = Auth::user();
        
        $liveSession = LiveSession::where('id', $id)
            ->where('tutor_id', $user->id)
            ->firstOrFail();
            
        // Check if session is live
        if ($liveSession->status !== 'live') {
            return response()->json([
                'success' => false,
                'message' => 'Only live sessions can be ended'
            ], 422);
        }
        
        $validated = $request->validate([
            'recording_url' => 'nullable|url',
            'notes' => 'nullable|string',
        ]);
        
        $now = Carbon::now();
        
        // Update session
        $liveSession->update([
            'status' => 'ended',
            'actual_end_time' => $now,
            'recording_url' => $validated['recording_url'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Live session ended successfully',
            'session' => $liveSession->load(['tutorial', 'course'])
        ]);
        
    } catch (\Exception $e) {
        Log::error('End live session error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to end live session',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Cancel a scheduled live session
 * POST /tutor/live-sessions/{id}/cancel
 */
public function cancelLiveSession(Request $request, $id)
{
    try {
        $user = Auth::user();
        
        $liveSession = LiveSession::where('id', $id)
            ->where('tutor_id', $user->id)
            ->firstOrFail();
            
        // Only allow cancelling scheduled sessions
        if ($liveSession->status !== 'scheduled') {
            return response()->json([
                'success' => false,
                'message' => 'Only scheduled sessions can be cancelled'
            ], 422);
        }
        
        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);
        
        $liveSession->update([
            'status' => 'cancelled',
            'cancellation_reason' => $validated['cancellation_reason'],
            'cancelled_at' => Carbon::now(),
        ]);
        
        // Notify students about cancellation
        $this->notifyStudentsAboutCancellation($liveSession, $validated['cancellation_reason']);
        
        return response()->json([
            'success' => true,
            'message' => 'Live session cancelled successfully',
            'session' => $liveSession
        ]);
        
    } catch (\Exception $e) {
        Log::error('Cancel live session error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to cancel live session',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Delete a live session (only if cancelled or ended)
 * DELETE /tutor/live-sessions/{id}
 */
public function deleteLiveSession($id)
{
    try {
        $user = Auth::user();
        
        $liveSession = LiveSession::where('id', $id)
            ->where('tutor_id', $user->id)
            ->firstOrFail();
            
        // Only allow deleting cancelled or ended sessions
        if (!in_array($liveSession->status, ['cancelled', 'ended'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only cancelled or ended sessions can be deleted'
            ], 422);
        }
        
        $liveSession->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Live session deleted successfully'
        ]);
        
    } catch (\Exception $e) {
        Log::error('Delete live session error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete live session',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get live session details with participants
 * GET /tutor/live-sessions/{id}/details
 */
public function getLiveSessionDetails($id)
{
    try {
        $user = Auth::user();
        
        $liveSession = LiveSession::with(['tutorial', 'course'])
            ->where('id', $id)
            ->where('tutor_id', $user->id)
            ->firstOrFail();
            
        // Get enrolled students for this tutorial
        $enrolledStudents = Enrollment::where('tutorial_id', $liveSession->tutorial_id)
            ->with('user')
            ->get()
            ->map(function($enrollment) {
                return [
                    'id' => $enrollment->user_id,
                    'name' => $enrollment->user->name,
                    'email' => $enrollment->user->email,
                    'profile_photo' => $enrollment->user->profile_photo,
                ];
            });
            
        return response()->json([
            'success' => true,
            'session' => $liveSession,
            'enrolled_students' => $enrolledStudents,
            'total_participants' => $enrolledStudents->count(),
        ]);
        
    } catch (\Exception $e) {
        Log::error('Get live session details error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch live session details',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get upcoming live sessions (dashboard widget)
 * GET /tutor/live-sessions/upcoming
 */
public function getUpcomingLiveSessions(Request $request)
{
    try {
        $user = Auth::user();
        
        $limit = $request->query('limit', 5);
        
        $upcomingSessions = LiveSession::with(['tutorial', 'course'])
            ->where('tutor_id', $user->id)
            ->where('status', 'scheduled')
            ->where('start_time', '>=', now())
            ->orderBy('start_time', 'asc')
            ->limit($limit)
            ->get();
            
        return response()->json([
            'success' => true,
            'sessions' => $upcomingSessions,
            'count' => $upcomingSessions->count()
        ]);
        
    } catch (\Exception $e) {
        Log::error('Get upcoming live sessions error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch upcoming live sessions',
            'error' => $e->getMessage()
        ], 500);
    }
}

// Helper methods for notifications
private function notifyStudentsAboutLiveSession(LiveSession $session)
{
    try {
        // Get all enrolled students for this tutorial
        $enrollments = Enrollment::where('tutorial_id', $session->tutorial_id)
            ->with('user')
            ->get();
            
        foreach ($enrollments as $enrollment) {
            // Create notification for each student
            \App\Models\Notification::create([
                'user_id' => $enrollment->user_id,
                'type' => 'live_session_started',
                'title' => 'Live Session Started',
                'message' => "Live session '{$session->title}' has started. Join now!",
                'data' => json_encode([
                    'session_id' => $session->id,
                    'tutorial_id' => $session->tutorial_id,
                    'meeting_url' => $session->meeting_url,
                    'title' => $session->title,
                ]),
                'read_at' => null,
            ]);
            
            // You could also send email or push notification here
        }
        
    } catch (\Exception $e) {
        Log::error('Notify students about live session error: ' . $e->getMessage());
    }
}

private function notifyStudentsAboutCancellation(LiveSession $session, $reason)
{
    try {
        $enrollments = Enrollment::where('tutorial_id', $session->tutorial_id)
            ->with('user')
            ->get();
            
        foreach ($enrollments as $enrollment) {
            \App\Models\Notification::create([
                'user_id' => $enrollment->user_id,
                'type' => 'live_session_cancelled',
                'title' => 'Live Session Cancelled',
                'message' => "Live session '{$session->title}' has been cancelled. Reason: {$reason}",
                'data' => json_encode([
                    'session_id' => $session->id,
                    'tutorial_id' => $session->tutorial_id,
                    'title' => $session->title,
                    'reason' => $reason,
                ]),
                'read_at' => null,
            ]);
        }
        
    } catch (\Exception $e) {
        Log::error('Notify students about cancellation error: ' . $e->getMessage());
    }
}
}