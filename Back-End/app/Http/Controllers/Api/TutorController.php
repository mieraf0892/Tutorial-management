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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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

public function getTutorTutorials()
{
    try {
        $user = Auth::user();
        
        $tutorials = Tutorial::where('tutor_id', $user->id)
            ->select('id', 'title')
            ->get();

        return response()->json([
            'success' => true,
            'tutorials' => $tutorials
        ]);

    } catch (\Exception $e) {
        Log::error('Get tutor tutorials error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch tutorials',
            'error' => $e->getMessage()
        ], 500);
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

    
public function createTutorial(Request $request)
{
    try {
        $user = Auth::user();
        
        // Validate the request - match frontend field names
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'level' => 'required|in:beginner,intermediate,advanced',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'image' => 'nullable|string',
            'learning_objectives' => 'nullable|array',
            'requirements' => 'nullable|array',
            'instructor' => 'nullable|string',
            'instructor_bio' => 'nullable|string',
            'lessons' => 'nullable|integer|min:0',
            'includes' => 'nullable|array',
        ]);

        // Create the tutorial - tutor creates, needs admin approval
        $tutorial = Tutorial::create([
            'tutor_id' => $user->id,
            'created_by_role' => 'tutor',
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category_id' => $validated['category_id'],
            'level' => $validated['level'],
            'price' => $validated['price'],
            'duration' => $validated['duration'],
            'image' => $validated['image'] ?? null,
            'learning_objectives' => $validated['learning_objectives'] ?? [],
            'requirements' => $validated['requirements'] ?? [],
            'instructor' => $validated['instructor'] ?? $user->name,
            'instructor_bio' => $validated['instructor_bio'] ?? '',
            'instructor_experience' => '',
            'lessons' => $validated['lessons'] ?? 0,
            'includes' => $validated['includes'] ?? [],
            'is_published' => false, // Not published until approved
            'status' => 'pending_approval', // Needs admin approval
            'enrollment_count' => 0,
            'rating' => 0,
            'content' => ''
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tutorial created successfully. Waiting for admin approval.',
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

// In TutorController.php

/**
 * Get assignments for current tutor
 */
public function getAssignments(Request $request)
{
    $user = Auth::user();
    
    $assignments = TutorialAssignment::with(['tutorial', 'tutorial.category', 'assignedBy'])
        ->where('tutor_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->get();
    
    return response()->json([
        'success' => true,
        'assignments' => $assignments
    ]);
}

public function acceptAssignment(Request $request, $assignmentId)
{
    $user = Auth::user();
    
    $assignment = TutorialAssignment::where('id', $assignmentId)
        ->where('tutor_id', $user->id)
        ->where('status', 'pending')  // ← MUST BE PENDING
        ->firstOrFail();
    
    $assignment->accept();
    
    // ✅ FIX: Update tutorial status to 'in_progress'
    $assignment->tutorial->update([
        'status' => 'in_progress', // NOT 'approved'
        'tutor_id' => $user->id
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Assignment accepted successfully',
        'assignment' => $assignment->load(['tutorial', 'assignedBy'])
    ]);
}

/**
 * Reject an assignment
 */
public function rejectAssignment(Request $request, $assignmentId)
{
    $user = Auth::user();
    
    $assignment = TutorialAssignment::where('id', $assignmentId)
        ->where('tutor_id', $user->id)
        ->where('status', 'pending')
        ->firstOrFail();
    
    $assignment->reject($request->reason);
    
    return response()->json([
        'success' => true,
        'message' => 'Assignment rejected',
        'assignment' => $assignment
    ]);
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
}