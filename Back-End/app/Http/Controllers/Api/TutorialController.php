<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tutorial;
use App\Models\Category;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TutorialController extends Controller
{
    public function index(Request $request)
{
    try {
        // Start with base query
        $query = Tutorial::with(['category', 'tutor.user'])
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
        if ($request->has('level') && $request->level !== 'all') {
            $query->where('level', $request->level);
        }

        // Order and get results
        $tutorials = $query->orderBy('students', 'desc')->get();

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
        $tutorial = Tutorial::with([
            'category',
            'tutor:user_id,id,qualification,experience_years,bio,city,country',
            'lessons' => function($query) {
                $query->orderBy('order');
            }
        ])->where('is_published', true)->findOrFail($id);

        $response = [
            'id' => $tutorial->id,
            'title' => $tutorial->title,
            'description' => $tutorial->description,
            'category' => $tutorial->category,
            'tutor_details' => $tutorial->tutor, // NEW
            'duration' => $tutorial->duration,
            'students' => $tutorial->students,
            'rating' => $tutorial->rating,
            'level' => $tutorial->level,
            'image' => $tutorial->image,
            'instructor' => $tutorial->instructor,
            'instructor_bio' => $tutorial->instructor_bio ?? 'Expert instructor with years of experience',
            'instructor_experience' => $tutorial->instructor_experience ?? '10+ years experience',
            'lessons' => $tutorial->lessons,
            'total_lessons' => $tutorial->total_lessons,
            'price' => $tutorial->price,
            'is_published' => $tutorial->is_published,
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
        ];

        // User-specific data
        if (Auth::check()) {
            $user = Auth::user();
            $response['is_enrolled'] = $user->enrollments()->where('tutorial_id', $tutorial->id)->exists();

            if ($response['is_enrolled']) {
                $completedLessons = $user->lessonCompletions()->where('tutorial_id', $tutorial->id)->count();
                $response['user_progress'] = [
                    'completed_lessons' => $completedLessons,
                    'total_lessons' => $tutorial->total_lessons,
                    'progress_percentage' => $tutorial->total_lessons > 0
                        ? ($completedLessons / $tutorial->total_lessons) * 100
                        : 0,
                ];
            } else {
                $response['user_progress'] = null;
            }
        } else {
            $response['is_enrolled'] = false;
            $response['user_progress'] = null;
        }

        return response()->json([
            'success' => true,
            'tutorial' => $response
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Tutorial not found'
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

    // Enrollment endpoint
    public function enroll(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $tutorial = Tutorial::findOrFail($id);

            // Check if already enrolled
            if ($user->enrollments()->where('tutorial_id', $id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Already enrolled in this tutorial'
                ], 400);
            }

            // Create enrollment
            Enrollment::create([
                'user_id' => $user->id,
                'tutorial_id' => $id
            ]);

            // Increment students count
            $tutorial->increment('students');

            return response()->json([
                'success' => true,
                'message' => 'Successfully enrolled in tutorial'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to enroll in tutorial'
            ], 500);
        }
    }
}