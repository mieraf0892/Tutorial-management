<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Enrollment;
use App\Models\Tutorial;
use App\Models\Course;
use App\Models\StudentCourseDetail;
use App\Models\LessonCompletion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class StudentController extends Controller
{
    // Get student dashboard data
    public function dashboard()
{
    try {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student profile not found'
            ], 404);
        }

        // Get enrolled tutorials
        $enrollments = Enrollment::with(['tutorial.category'])
            ->where('user_id', $user->id)
            ->get();

        // Calculate basic stats
        $totalEnrolled = $enrollments->count();
        $completedTutorials = $enrollments->whereNotNull('completed_at')->count();
        $inProgressTutorials = $enrollments->where('completed_at', null)->count();

        // Get enrolled tutorial IDs
        $enrolledTutorialIds = $enrollments->pluck('tutorial_id');
        
        // Get upcoming sessions for enrolled tutorials
        $scheduledSessions = \App\Models\TutorialSession::whereIn('tutorial_id', $enrolledTutorialIds)
            ->where('status', 'scheduled')
            ->where('start_time', '>', now())
            ->with(['tutorial', 'tutor'])
            ->orderBy('start_time', 'asc')
            ->get()
            ->map(function($session) {
                return [
                    'id' => $session->id,
                    'tutorial_id' => $session->tutorial_id,
                    'tutorial_title' => $session->tutorial->title,
                    'tutor_id' => $session->tutor_id,
                    'tutor_name' => $session->tutor->name ?? 'Tutor',
                    'title' => $session->title,
                    'start_time' => $session->start_time,
                    'end_time' => $session->end_time,
                    'status' => $session->status,
                    'meeting_link' => $session->meeting_link,
                ];
            });

        // Calculate attendance stats
        $attendanceRecords = \App\Models\Attendance::where('user_id', $user->id)->get();
        $totalAttendanceRecords = $attendanceRecords->count();
        $presentAttendance = $attendanceRecords->whereIn('status', ['present', 'late'])->count();
        $attendanceRate = $totalAttendanceRecords > 0 ? round(($presentAttendance / $totalAttendanceRecords) * 100) : 0;

        // Get recent activities
        $recentActivities = LessonCompletion::with(['lesson.tutorial'])
            ->where('user_id', $user->id)
            ->orderBy('completed_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'dashboard' => [
                'student' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'profile' => $student
                ],
                'stats' => [
                    'total_enrolled' => $totalEnrolled,
                    'completed_tutorials' => $completedTutorials,
                    'in_progress_tutorials' => $inProgressTutorials,
                    'total_lessons_completed' => LessonCompletion::where('user_id', $user->id)->count(),
                    'upcoming_sessions' => $scheduledSessions->count(),
                    'attendance_rate' => $attendanceRate,
                    'total_paid' => 0, // You can calculate this from payments table
                ],
                'enrolled_tutorials' => $enrollments->map(function ($enrollment) {
                    $tutorial = $enrollment->tutorial;
                    $completedLessons = LessonCompletion::where('user_id', $enrollment->user_id)
                        ->where('tutorial_id', $tutorial->id)
                        ->count();
                    $totalLessons = $tutorial->lessons()->count();
                    
                    return [
                        'id' => $tutorial->id,
                        'title' => $tutorial->title,
                        'description' => $tutorial->description,
                        'category' => $tutorial->category->name,
                        'image' => $tutorial->image,
                        'instructor' => $tutorial->instructor,
                        'progress_percentage' => $totalLessons > 0 ? ($completedLessons / $totalLessons) * 100 : 0,
                        'completed_lessons' => $completedLessons,
                        'total_lessons' => $totalLessons,
                        'last_accessed' => $enrollment->updated_at,
                        'is_completed' => $enrollment->completed_at !== null,
                        'tutor_id' => $tutorial->tutor_id,
                        'tutor_name' => $tutorial->tutor->name ?? 'Tutor',
                    ];
                }),
                'recent_activities' => $recentActivities->map(function ($completion) {
                    return [
                        'type' => 'lesson_completed',
                        'title' => "Completed: {$completion->lesson->title}",
                        'tutorial_name' => $completion->tutorial->title,
                        'time' => $completion->completed_at,
                        'description' => "You completed a lesson in {$completion->tutorial->title}"
                    ];
                }),
                'upcoming_lessons' => [],
                'scheduled_sessions' => $scheduledSessions,
                'payment_history' => [],
                'unread_messages' => 0,
                'notifications' => 0,
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('Student dashboard error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to load dashboard data',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get tutors list for messaging
 */
public function tutorsList(Request $request)
{
    try {
        $student = $request->user();
        
        if ($student->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Students only.'
            ], 403);
        }

        // Get tutors from student's enrolled tutorials
        $tutors = \App\Models\User::where('role', 'tutor')
            ->whereHas('tutorials.enrollments', function($query) use ($student) {
                $query->where('student_id', $student->id);
            })
            ->with(['tutorials' => function($query) use ($student) {
                $query->whereHas('enrollments', function($q) use ($student) {
                    $q->where('student_id', $student->id);
                });
            }])
            ->get()
            ->map(function($tutor) {
                return [
                    'id' => $tutor->id,
                    'name' => $tutor->name,
                    'email' => $tutor->email,
                    'tutorials' => $tutor->tutorials->map(function($tutorial) {
                        return $tutorial->title;
                    })
                ];
            });

        return response()->json([
            'success' => true,
            'tutors' => $tutors
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch tutors',
            'error' => $e->getMessage()
        ], 500);
    }
}

// Add this method to StudentController.php
public function attendance()
{
    try {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student profile not found'
            ], 404);
        }

        // Get real attendance records
        $attendanceRecords = \App\Models\Attendance::with(['tutorial', 'tutorialSession'])
            ->where('user_id', $user->id)
            ->orderBy('session_date', 'desc')
            ->get();

        // Calculate stats from real data
        $totalSessions = $attendanceRecords->count();
        $presentSessions = $attendanceRecords->where('status', 'present')->count();
        $lateSessions = $attendanceRecords->where('status', 'late')->count();
        $absentSessions = $attendanceRecords->where('status', 'absent')->count();
        $attendanceRate = $totalSessions > 0 ? ($presentSessions / $totalSessions) * 100 : 0;

        // Group by tutorial for tutorial-wise attendance
        $tutorialAttendance = [];
        $tutorialGroups = $attendanceRecords->groupBy('tutorial_id');
        
        foreach ($tutorialGroups as $tutorialId => $records) {
            $tutorial = $records->first()->tutorial;
            $total = $records->count();
            $present = $records->where('status', 'present')->count();
            $late = $records->where('status', 'late')->count();
            $absent = $records->where('status', 'absent')->count();
            $rate = $total > 0 ? ($present / $total) * 100 : 0;

            $tutorialAttendance[] = [
                'tutorial_id' => $tutorialId,
                'tutorial_title' => $tutorial->title,
                'instructor' => $tutorial->instructor,
                'total_sessions' => $total,
                'present_sessions' => $present,
                'attendance_rate' => round($rate),
                'late_sessions' => $late,
                'absent_sessions' => $absent
            ];
        }

        return response()->json([
            'success' => true,
            'attendance' => [
                'stats' => [
                    'total_sessions' => $totalSessions,
                    'present_sessions' => $presentSessions,
                    'attendance_rate' => round($attendanceRate),
                    'late_sessions' => $lateSessions,
                    'absent_sessions' => $absentSessions,
                ],
                'records' => $attendanceRecords->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'tutorial_id' => $record->tutorial_id,
                        'tutorial_title' => $record->tutorial->title,
                        'tutorial_session_id' => $record->tutorial_session_id,
                        'session_title' => $record->tutorialSession ? $record->tutorialSession->title : 'General Session',
                        'session_date' => $record->session_date,
                        'status' => $record->status,
                        'duration_minutes' => $record->duration_minutes,
                        'instructor_notes' => $record->instructor_notes,
                        'session_type' => $record->session_type,
                    ];
                })->toArray(),
                'tutorial_attendance' => $tutorialAttendance
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('Student attendance error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to load attendance data',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get attendance for a specific tutorial - SIMPLIFIED VERSION
 */
public function getTutorialAttendance($tutorialId)
{
    try {
        $user = Auth::user();
        
        // Verify enrollment
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('tutorial_id', $tutorialId)
            ->first();

        if (!$enrollment) {
            return response()->json([
                'success' => false,
                'message' => 'You are not enrolled in this tutorial'
            ], 403);
        }

        // Get basic tutorial info
        $tutorial = Tutorial::find($tutorialId);
        
        // Get simple attendance records (without session dependency)
        $attendanceRecords = \App\Models\Attendance::where('user_id', $user->id)
            ->where('tutorial_id', $tutorialId)
            ->orderBy('session_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'attendance' => [
                'tutorial' => [
                    'id' => $tutorial->id,
                    'title' => $tutorial->title,
                    'instructor' => $tutorial->instructor,
                ],
                'records' => $attendanceRecords->map(function($record) {
                    return [
                        'id' => $record->id,
                        'session_date' => $record->session_date,
                        'status' => $record->status,
                        'duration_minutes' => $record->duration_minutes,
                        'instructor_notes' => $record->instructor_notes,
                        'session_type' => $record->session_type,
                    ];
                }),
                'stats' => [
                    'total_records' => $attendanceRecords->count(),
                    'present_count' => $attendanceRecords->where('status', 'present')->count(),
                    'late_count' => $attendanceRecords->where('status', 'late')->count(),
                    'absent_count' => $attendanceRecords->where('status', 'absent')->count(),
                    'attendance_rate' => $attendanceRecords->count() > 0 ? 
                        round(($attendanceRecords->whereIn('status', ['present', 'late'])->count() / $attendanceRecords->count()) * 100, 2) : 0,
                ]
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('Get tutorial attendance error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch tutorial attendance',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get comprehensive attendance summary
 */
public function getAttendanceSummary()
{
    try {
        $user = Auth::user();
        
        // Get all enrollments with proper error handling
        $enrollments = Enrollment::with('tutorial')
            ->where('user_id', $user->id)
            ->get();

        $summary = [
            'overall' => [
                'total_tutorials' => 0,
                'total_sessions' => 0,
                'attended_sessions' => 0,
                'attendance_rate' => 0,
                'total_learning_hours' => 0,
            ],
            'tutorials' => [],
            'monthly_trend' => [],
            'status_distribution' => []
        ];

        $totalSessionsAll = 0;
        $attendedSessionsAll = 0;
        $totalLearningHours = 0;

        foreach ($enrollments as $enrollment) {
            $tutorial = $enrollment->tutorial;
            
            // Check if tutorial exists and has sessions
            if (!$tutorial) {
                continue;
            }

            // Safely get sessions with null check
            $sessions = $tutorial->sessions ?? collect();
            $attendanceRecords = \App\Models\Attendance::where('user_id', $user->id)
                ->where('tutorial_id', $tutorial->id)
                ->get();

            $totalSessions = $sessions->count();
            $attendedSessions = $attendanceRecords->whereIn('status', ['present', 'late'])->count();
            $attendanceRate = $totalSessions > 0 ? round(($attendedSessions / $totalSessions) * 100, 2) : 0;
            $learningHours = round($attendanceRecords->sum('duration_minutes') / 60, 1);

            $summary['tutorials'][] = [
                'tutorial_id' => $tutorial->id,
                'tutorial_title' => $tutorial->title,
                'instructor' => $tutorial->instructor,
                'total_sessions' => $totalSessions,
                'attended_sessions' => $attendedSessions,
                'attendance_rate' => $attendanceRate,
                'learning_hours' => $learningHours,
                'last_attended' => $attendanceRecords->sortByDesc('session_date')->first()->session_date ?? null,
            ];

            $totalSessionsAll += $totalSessions;
            $attendedSessionsAll += $attendedSessions;
            $totalLearningHours += $learningHours;
        }

        // Overall statistics with safe calculations
        $summary['overall']['total_tutorials'] = $enrollments->count();
        $summary['overall']['total_sessions'] = $totalSessionsAll;
        $summary['overall']['attended_sessions'] = $attendedSessionsAll;
        $summary['overall']['attendance_rate'] = $totalSessionsAll > 0 ? 
            round(($attendedSessionsAll / $totalSessionsAll) * 100, 2) : 0;
        $summary['overall']['total_learning_hours'] = $totalLearningHours;

        // Monthly trend (last 6 months) with safe query
        $sixMonthsAgo = now()->subMonths(6)->startOfMonth();
        
        $monthlyAttendance = \App\Models\Attendance::where('user_id', $user->id)
            ->where('session_date', '>=', $sixMonthsAgo)
            ->get()
            ->groupBy(function($record) {
                return $record->session_date->format('Y-m');
            })
            ->map(function($monthRecords, $month) {
                $totalSessions = $monthRecords->count();
                $attendedSessions = $monthRecords->whereIn('status', ['present', 'late'])->count();
                
                return [
                    'month' => $month,
                    'month_name' => \Carbon\Carbon::createFromFormat('Y-m', $month)->format('M Y'),
                    'total_sessions' => $totalSessions,
                    'attended_sessions' => $attendedSessions,
                    'attendance_rate' => $totalSessions > 0 ? round(($attendedSessions / $totalSessions) * 100, 2) : 0,
                ];
            })
            ->values();

        $summary['monthly_trend'] = $monthlyAttendance;

        // Status distribution with safe query
        $allAttendance = \App\Models\Attendance::where('user_id', $user->id)->get();
        $summary['status_distribution'] = [
            'present' => $allAttendance->where('status', 'present')->count(),
            'late' => $allAttendance->where('status', 'late')->count(),
            'absent' => $totalSessionsAll - $attendedSessionsAll,
            'excused' => $allAttendance->where('status', 'excused')->count(),
        ];

        // Sort tutorials by attendance rate (descending)
        usort($summary['tutorials'], function($a, $b) {
            return $b['attendance_rate'] <=> $a['attendance_rate'];
        });

        return response()->json([
            'success' => true,
            'summary' => $summary
        ]);

    } catch (\Exception $e) {
        Log::error('Get attendance summary error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to generate attendance summary',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Get enrolled tutorials with basic attendance info
 */
public function enrolledTutorials()
{
    try {
        $user = Auth::user();
        
        $enrollments = Enrollment::with(['tutorial.category', 'tutorial.sessions'])
            ->where('user_id', $user->id)
            ->get();

        $tutorials = $enrollments->map(function ($enrollment) use ($user) {
            $tutorial = $enrollment->tutorial;
            
            // Calculate attendance for this tutorial
            $attendanceRecords = \App\Models\Attendance::where('user_id', $user->id)
                ->where('tutorial_id', $tutorial->id)
                ->get();
                
            $totalSessions = $tutorial->sessions->count();
            $attendedSessions = $attendanceRecords->whereIn('status', ['present', 'late'])->count();
            $attendanceRate = $totalSessions > 0 ? round(($attendedSessions / $totalSessions) * 100, 2) : 0;
            
            // Lesson completion progress
            $completedLessons = LessonCompletion::where('user_id', $user->id)
                ->where('tutorial_id', $tutorial->id)
                ->count();
            $totalLessons = $tutorial->lessons()->count();
            $progressPercentage = $totalLessons > 0 ? ($completedLessons / $totalLessons) * 100 : 0;

            return [
                'id' => $tutorial->id,
                'title' => $tutorial->title,
                'description' => $tutorial->description,
                'category' => $tutorial->category->name,
                'image' => $tutorial->image,
                'instructor' => $tutorial->instructor,
                'level' => $tutorial->level,
                'price' => $tutorial->price,
                'enrollment_date' => $enrollment->created_at,
                'progress_percentage' => round($progressPercentage, 1),
                'completed_lessons' => $completedLessons,
                'total_lessons' => $totalLessons,
                'attendance_rate' => $attendanceRate,
                'attended_sessions' => $attendedSessions,
                'total_sessions' => $totalSessions,
                'last_accessed' => $enrollment->updated_at,
                'is_completed' => $enrollment->completed_at !== null,
                'has_upcoming_sessions' => $tutorial->sessions->where('start_time', '>', now())->isNotEmpty(),
            ];
        });

        return response()->json([
            'success' => true,
            'tutorials' => $tutorials
        ]);

    } catch (\Exception $e) {
        Log::error('Enrolled tutorials error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch enrolled tutorials',
            'error' => $e->getMessage()
        ], 500);
    }
}

// In StudentController or new controller
public function getRecommendedCourses(Request $request)
{
    $student = Student::where('user_id', $request->user()->id)->first();
    
    if (!$student) {
        return response()->json([
            'success' => false,
            'message' => 'Student not found'
        ], 404);
    }
    
    // Get courses matching student's course_type
    $courses = Course::where('category', $student->course_type)
                    ->where('is_active', true)
                    ->get();
    
    // Also check StudentCourseDetail for specific interests
    $specificInterests = StudentCourseDetail::where('student_id', $student->id)
                                          ->pluck('field_value');
    
    return response()->json([
        'success' => true,
        'data' => [
            'courses' => $courses,
            'student_preference' => $student->learningPreference?->learning_preference,
            'specific_interests' => $specificInterests
        ]
    ]);
}

public function getPreferences(Request $request)
{
    try {
        $user = $request->user();
        
        // Get student with learning preferences
        $student = \App\Models\Student::with(['learningPreferences', 'courseDetails'])
                     ->where('user_id', $user->id)
                     ->first();
        
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student profile not found'
            ], 404);
        }
        
        // Map course type to match categories
        $courseType = $student->course_type;
        $categoryMap = [
            'programming' => 'programming',
            'language' => 'languages',
            'school grades' => 'school-grades',
            'entrance preparation' => 'entrance-exams',
        ];
        
        $mappedCategory = $categoryMap[strtolower($courseType)] ?? $courseType;
        
        // Clean the emoji from subcategory values
        $cleanEmoji = function($value) {
            return trim(str_replace(['🧠', '💻', '📱', '🇪🇹', '🇬🇧', '🇨🇳', '🇸🇦', '🇫🇷'], '', $value));
        };
        
        // Get ALL subcategories based on course type
        $subcategories = [];
        $specificInterests = [];
        
        foreach ($student->courseDetails as $detail) {
            $cleanValue = $cleanEmoji($detail->field_value);
            
            // Programming subcategories (AI 🧠, Web 💻, App 📱)
            if ($courseType === 'Programming' && strpos($detail->field_type, 'programming') !== false) {
                $subcategories[] = $cleanValue;
            }
            // Language subcategories
            elseif ($courseType === 'Language' && strpos($detail->field_type, 'selectedLanguages') !== false) {
                $subcategories[] = $cleanValue;
            }
            // School grades subcategories
            elseif ($courseType === 'School Grades') {
                if ($detail->field_type === 'selectedGrade') {
                    $subcategories[] = 'Grade ' . $cleanValue;
                } elseif (strpos($detail->field_type, 'selectedSubjects') !== false) {
                    $specificInterests[] = $cleanValue;
                }
            }
            // Entrance exams subcategories
            elseif ($courseType === 'Entrance Preparation' && strpos($detail->field_type, 'selectedExam') !== false) {
                $subcategories[] = $cleanValue;
            }
            
            // For any field, add to specific interests
            $specificInterests[] = $cleanValue;
        }
        
        // Remove duplicates and empty values
        $subcategories = array_values(array_unique(array_filter($subcategories)));
        $specificInterests = array_values(array_unique(array_filter($specificInterests)));
        
        return response()->json([
            'success' => true,
            'message' => 'Preferences retrieved successfully',
            'data' => [
                'course_type' => $mappedCategory,
                'learning_preference' => $student->learningPreferences?->learning_preference ?? 'group',
                'preferred_days' => $student->learningPreferences?->study_days ?? [],
                'hours_per_day' => $student->learningPreferences?->hours_per_day ?? 1,
                'learning_mode' => $student->learningPreferences?->learning_mode ?? 'online',
                'raw_course_type' => $student->course_type,
                'subcategories' => $subcategories, // Changed from subcategory to subcategories (array)
                'primary_subcategory' => !empty($subcategories) ? $subcategories[0] : null,
                'specific_interests' => $specificInterests,
            ]
        ]);
        
    } catch (\Exception $e) {
        Log::error('Failed to retrieve preferences: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve preferences',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function index(): JsonResponse // 2. This now points to the Illuminate version
    {
        try {
            // Fetch students with their associated user data
            $students = Student::with('user')->get();
            
            return response()->json($students);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching students',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}