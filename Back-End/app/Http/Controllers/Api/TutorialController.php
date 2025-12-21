<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tutorial;
use App\Models\Category;
use App\Models\Enrollment;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TutorialController extends Controller
{
    public function index(Request $request)
{
    try {
        // Start with base query
        $query = Tutorial::with(['category', 'tutor'])
            ->where('is_published', true);

        // Search filter
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhere('instructor', 'like', "%{$searchTerm}%");
            });
        }

        // Category filter
        if ($request->has('category') && $request->category !== 'all') {
            $category = Category::where('name', $request->category)->first();
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        // Level filter
        if ($request->has('level') && $request.level !== 'all') {
            $query->where('level', $request->level);
        }

        // Order and get results - FIXED LINE
        $tutorials = $query->orderBy('enrollment_count', 'desc')->get();

        // Add preview information for each tutorial
        $tutorials = $tutorials->map(function($tutorial) {
            $tutorialData = $tutorial->toArray();
            
            // For public listing, show limited information
            $tutorialData['has_preview'] = $tutorial->has_preview ?? true;
            $tutorialData['preview_description'] = $tutorial->preview_description ?? 
                substr($tutorial->description, 0, 150) . '...';
            $tutorialData['preview_lessons_count'] = $tutorial->preview_lessons_count ?? 2;
            
            // Remove full lessons from listing
            unset($tutorialData['lessons']);
            
            return $tutorialData;
        });

        return response()->json([
            'success' => true,
            'tutorials' => $tutorials,
            'total' => $tutorials->count()
        ]);

    } catch (\Exception $e) {
        Log::error('Tutorial index error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch tutorials',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function show($id)
{
    try {
        // Load tutorial WITHOUT any relationships initially
         $tutorial = Tutorial::with(['category', 'tutor'])
            ->where('is_published', true)
            ->findOrFail($id);
        
        // Load category separately
        $category = Category::find($tutorial->category_id);
        
        // Load tutor details
        $tutorDetails = null;
        if ($tutorial->tutor_id) {
            $tutor = \App\Models\Tutor::with('user')->find($tutorial->tutor_id);
            if ($tutor) {
                $tutorDetails = [
                    'id' => $tutor->id,
                    'name' => $tutor->user->name ?? $tutorial->instructor,
                    'email' => $tutor->user->email ?? null,
                    'qualification' => $tutor->qualification,
                    'experience_years' => $tutor->experience_years,
                    'bio' => $tutor->bio,
                    'city' => $tutor->city,
                    'country' => $tutor->country,
                ];
            }
        }
        
        // If no tutor details, use instructor field
        if (!$tutorDetails) {
            $tutorDetails = [
                'name' => $tutorial->instructor,
                'email' => null,
                'qualification' => 'Not specified',
                'experience_years' => 0,
                'bio' => $tutorial->instructor_bio ?? 'Experienced instructor',
                'city' => 'Unknown',
                'country' => 'Unknown',
            ];
        }
        
        // Initialize base response
        $response = [
            'id' => $tutorial->id,
            'title' => $tutorial->title,
            'description' => $tutorial->description,
            'short_description' => $tutorial->short_description ?? 
                substr($tutorial->description, 0, 200) . '...',
            'preview_description' => $tutorial->preview_description ?? 
                substr($tutorial->description, 0, 150) . '...',
            'category' => $category,
            'tutor_details' => $tutorDetails,
            'duration' => $tutorial->duration,
            'students' => $tutorial->enrollment_count, 
            'rating' => (float) $tutorial->rating,
            'level' => $tutorial->level,
            'image' => $tutorial->image,
            'instructor' => $tutorial->instructor,
            'instructor_bio' => $tutorial->instructor_bio ?? 'Expert instructor with years of experience',
            'instructor_experience' => $tutorial->instructor_experience ?? '10+ years experience',
            'price' => (float) $tutorial->price,
            'is_free' => (bool) ($tutorial->is_free ?? false),
            'is_published' => (bool) $tutorial->is_published,
            'has_preview' => (bool) ($tutorial->has_preview ?? true),
            'preview_video_url' => $tutorial->preview_video_url,
            'preview_lessons_count' => $tutorial->preview_lessons_count ?? 2,
            'learning_objectives' => $tutorial->learning_objectives ?? [
                'Core concepts and fundamentals',
                'Hands-on practical projects', 
                'Industry best practices',
                'Real-world applications'
            ],
            'includes' => $tutorial->includes ?? [
                'Lifetime access',
                'Certificate of completion',
                'Downloadable resources',
                'Q&A support'
            ],
            'created_at' => $tutorial->created_at,
            'updated_at' => $tutorial->updated_at,
        ];

        // Get total lessons count using direct query
        $totalLessons = $tutorial->lessons()->count();
        $response['total_lessons'] = $totalLessons;
        
        // Check enrollment status
        $isEnrolled = false;
        $userProgress = null;
        $hasAccess = false;
        
        // Determine if user has access
        if (Auth::check()) {
            $user = Auth::user();
            $isEnrolled = Enrollment::where('user_id', $user->id)
                ->where('tutorial_id', $tutorial->id)
                ->exists();
                
            $hasAccess = $isEnrolled || ($tutorial->is_free ?? false) || 
                       in_array($user->role, ['tutor', 'admin', 'super_admin']);
            
            if ($hasAccess) {
                // User has full access - load all lessons
                $lessons = Lesson::where('tutorial_id', $tutorial->id)
                    ->orderBy('order')
                    ->get();
                $response['lessons'] = $lessons;
                $response['has_full_access'] = true;
                
                if ($isEnrolled) {
                    // Calculate progress for enrolled students
                    $completedLessons = 0;
                    if (class_exists('\App\Models\LessonCompletion')) {
                        $completedLessons = \App\Models\LessonCompletion::where('user_id', $user->id)
                            ->where('tutorial_id', $tutorial->id)
                            ->count();
                    }
                    
                    $userProgress = [
                        'completed_lessons' => $completedLessons,
                        'total_lessons' => $totalLessons,
                        'progress_percentage' => $totalLessons > 0
                            ? round(($completedLessons / $totalLessons) * 100, 2)
                            : 0,
                    ];
                }
            } else {
                // User is logged in but not enrolled - show preview
                $previewCount = $tutorial->preview_lessons_count ?? 2;
                $lessons = Lesson::where('tutorial_id', $tutorial->id)
                    ->orderBy('order')
                    ->take($previewCount)
                    ->get();
                $response['lessons'] = $lessons;
                $response['preview_lessons'] = $lessons->count();
                $response['has_full_access'] = false;
            }
        } else {
            // Not logged in - always show preview
            $previewCount = $tutorial->preview_lessons_count ?? 2;
            $lessons = Lesson::where('tutorial_id', $tutorial->id)
                ->orderBy('order')
                ->take($previewCount)
                ->get();
            $response['lessons'] = $lessons;
            $response['preview_lessons'] = $lessons->count();
            $response['has_full_access'] = false;
            $hasAccess = ($tutorial->is_free ?? false);
        }

        $response['is_enrolled'] = $isEnrolled;
        $response['has_access'] = $hasAccess;
        $response['user_progress'] = $userProgress;

        return response()->json([
            'success' => true,
            'tutorial' => $response
        ]);

    } catch (\Exception $e) {
        Log::error('Tutorial show error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
        Log::error('Stack trace: ' . $e->getTraceAsString());
        return response()->json([
            'success' => false,
            'message' => 'Tutorial not found',
            'error' => $e->getMessage()
        ], 404);
    }
}

    public function getCategories()
    {
        try {
            $categories = Category::where('is_active', true)->get();

            return response()->json([
                'success' => true,
                'categories' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories'
            ], 500);
        }
    }

    public function getLevels()
    {
        return response()->json([
            'success' => true,
            'levels' => ['Beginner', 'Intermediate', 'Advanced']
        ]);
    }

    public function enroll(Request $request, $id)
{
    try {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required'
            ], 401);
        }

        $tutorial = Tutorial::findOrFail($id);

        // Check if already enrolled
        if ($user->enrollments()->where('tutorial_id', $id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Already enrolled in this tutorial'
            ], 400);
        }

        // Check if tutorial is free
        if ($tutorial->is_free ?? false) {
            return response()->json([
                'success' => false,
                'message' => 'This is a free tutorial. No enrollment needed.'
            ], 400);
        }

        // Create enrollment
        Enrollment::create([
            'user_id' => $user->id,
            'tutorial_id' => $id,
            'enrolled_at' => now(),
        ]);

        // FIX: Increment enrollment_count instead of students
        $tutorial->increment('enrollment_count');

        return response()->json([
            'success' => true,
            'message' => 'Successfully enrolled in tutorial'
        ]);

    } catch (\Exception $e) {
        Log::error('Enrollment error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to enroll in tutorial'
        ], 500);
    }
}

    // Check enrollment status
    public function checkEnrollment($id)
    {
        try {
            $user = Auth::user();
            $isEnrolled = false;
            $hasAccess = false;

            if ($user) {
                $tutorial = Tutorial::find($id);
                if ($tutorial) {
                    $isEnrolled = $user->enrollments()->where('tutorial_id', $id)->exists();
                    $hasAccess = $isEnrolled || ($tutorial->is_free ?? false) || 
                                in_array($user->role, ['tutor', 'admin', 'super_admin']);
                }
            }

            return response()->json([
                'success' => true,
                'is_enrolled' => $isEnrolled,
                'has_access' => $hasAccess
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check enrollment status'
            ], 500);
        }
    }
}