<?php
// app/Http\Controllers\Api\ClassController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassRoom;
use App\Models\Course;
use App\Models\StudentTutorAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ClassRoomController extends Controller
{
    /**
     * Display a listing of classes.
     */
    public function index(Request $request)
    {
        try {
            $query = ClassRoom::with(['course', 'tutor']);
            
            // Filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            if ($request->has('course_id')) {
                $query->where('course_id', $request->course_id);
            }
            
            if ($request->has('tutor_id')) {
                $query->where('tutor_id', $request->tutor_id);
            }
            
            if ($request->has('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('enrollment_code', 'like', '%' . $request->search . '%');
                });
            }
            
            // Pagination
            $perPage = $request->get('per_page', 10);
            $classes = $query->paginate($perPage);
            
            return response()->json([
                'success' => true,
                'message' => 'Classes retrieved successfully',
                'data' => $classes
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve classes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // MODIFY the store() method in ClassRoomController:
public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'course_id' => 'required|exists:courses,id',
        'tutor_id' => 'required|exists:users,id',
        'batch_name' => 'nullable|string|max:100',
        'max_capacity' => 'required|integer|min:1|max:100',
        'schedule' => 'nullable|string',
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
        'price' => 'nullable|numeric|min:0',
        'status' => 'in:draft,upcoming,ongoing,completed,cancelled',
        'level' => 'in:Beginner,Intermediate,Advanced',
        'learning_objectives' => 'nullable|array',
        'includes' => 'nullable|array',
        'image_url' => 'nullable|url',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation error',
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        // Generate enrollment code if not provided
        $enrollmentCode = $request->enrollment_code ?? $this->generateEnrollmentCode();
        
        // Check if tutor is actually a tutor
        $tutor = User::find($request->tutor_id);
        if ($tutor->role !== 'tutor') {
            return response()->json([
                'success' => false,
                'message' => 'Selected user is not a tutor'
            ], 422);
        }
        
        // 🆕 NEW: Create class with pending tutor status
        $class = ClassRoom::create([
            'title' => $request->title,
            'description' => $request->description,
            'course_id' => $request->course_id,
            'tutor_id' => $request->tutor_id,
            'batch_name' => $request->batch_name,
            'enrollment_code' => $enrollmentCode,
            'max_capacity' => $request->max_capacity,
            'current_enrollment' => 0,
            'schedule' => $request->schedule,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'price' => $request->price,
            'status' => 'draft', // Changed to draft until tutor accepts
            'tutor_status' => 'pending', // New column from migration
            'level' => $request->level ?? 'Beginner',
            'learning_objectives' => $request->learning_objectives,
            'includes' => $request->includes,
            'image_url' => $request->image_url,
        ]);
        
        // 🆕 NEW: Send notification to tutor
        $this->sendClassNotification($class, $tutor);
        
        return response()->json([
            'success' => true,
            'message' => 'Class created successfully. Tutor has been notified and must accept the class.',
            'note' => 'Class status: draft (will be upcoming when tutor accepts)',
            'data' => $class->load(['course', 'tutor'])
        ], 201);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to create class',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Display the specified class.
     */
    public function show($id)
    {
        try {
            $class = ClassRoom::with(['course', 'tutor'])->find($id);
            
            if (!$class) {
                return response()->json([
                    'success' => false,
                    'message' => 'Class not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Class retrieved successfully',
                'data' => $class
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve class',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified class.
     */
    public function update(Request $request, $id)
    {
        $class = ClassRoom::find($id);
        
        if (!$class) {
            return response()->json([
                'success' => false,
                'message' => 'Class not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'course_id' => 'sometimes|required|exists:courses,id',
            'tutor_id' => 'sometimes|required|exists:users,id',
            'batch_name' => 'nullable|string|max:100',
            'max_capacity' => 'sometimes|required|integer|min:1|max:100',
            'schedule' => 'nullable|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'price' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:draft,upcoming,ongoing,completed,cancelled',
            'level' => 'sometimes|in:Beginner,Intermediate,Advanced',
            'learning_objectives' => 'nullable|array',
            'includes' => 'nullable|array',
            'image_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check tutor if tutor_id is being updated
            if ($request->has('tutor_id')) {
                $tutor = User::find($request->tutor_id);
                if ($tutor->role !== 'tutor') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Selected user is not a tutor'
                    ], 422);
                }
            }
            
            $class->update($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Class updated successfully',
                'data' => $class->load(['course', 'tutor'])
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update class',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified class (soft delete).
     */
    public function destroy($id)
    {
        $class = ClassRoom::find($id);
        
        if (!$class) {
            return response()->json([
                'success' => false,
                'message' => 'Class not found'
            ], 404);
        }

        try {
            $class->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Class deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete class',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get class statistics.
     */
    public function stats()
    {
        try {
            $stats = [
                'total' => ClassRoom::count(),
                'draft' => ClassRoom::where('status', 'draft')->count(),
                'upcoming' => ClassRoom::where('status', 'upcoming')->count(),
                'ongoing' => ClassRoom::where('status', 'ongoing')->count(),
                'completed' => ClassRoom::where('status', 'completed')->count(),
                'cancelled' => ClassRoom::where('status', 'cancelled')->count(),
                'total_capacity' => ClassRoom::sum('max_capacity'),
                'total_enrollment' => ClassRoom::sum('current_enrollment'),
            ];
            
            return response()->json([
                'success' => true,
                'message' => 'Class statistics retrieved',
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

    /**
     * Generate unique enrollment code.
     */
    private function generateEnrollmentCode()
    {
        do {
            $code = 'CLASS-' . strtoupper(Str::random(6));
        } while (ClassRoom::where('enrollment_code', $code)->exists());
        
        return $code;
    }

   public function createFromAssignments(Request $request)
{
    $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'course_id' => 'required|exists:courses,id',
        'tutor_id' => 'required|exists:users,id,role,tutor',
        'batch_name' => 'nullable|string|max:255',
        'max_capacity' => 'required|integer|min:1',
        'schedule' => 'required|string',
        'start_date' => 'required|date',
        'end_date' => 'nullable|date|after:start_date',
        'price' => 'nullable|numeric|min:0',
        'level' => 'nullable|string|in:Beginner,Intermediate,Advanced',
        'assignment_ids' => 'required|array',
        'assignment_ids.*' => 'exists:student_tutor_assignments,id'
    ]);

    try {
        // Check if all assignments have same course and tutor
        $assignments = StudentTutorAssignment::whereIn('id', $request->assignment_ids)->get();
        
        $courseId = $assignments->first()->course_id;
        $tutorId = $assignments->first()->tutor_id;
        
        foreach ($assignments as $assignment) {
            if ($assignment->course_id !== $courseId || $assignment->tutor_id !== $tutorId) {
                return response()->json([
                    'success' => false,
                    'message' => 'All assignments must have the same course and tutor'
                ], 422);
            }
            
            if ($assignment->class_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some assignments are already assigned to a class'
                ], 422);
            }
        }

        // Generate enrollment code
        $enrollmentCode = 'CLASS' . strtoupper(Str::random(6));
        
        // Get tutor
        $tutor = User::find($request->tutor_id);
        
        // 🆕 NEW: Create class with pending tutor status
        $class = ClassRoom::create([
            'title' => $request->title,
            'description' => $request->description,
            'course_id' => $request->course_id,
            'tutor_id' => $request->tutor_id,
            'batch_name' => $request->batch_name,
            'enrollment_code' => $enrollmentCode,
            'max_capacity' => $request->max_capacity,
            'current_enrollment' => count($request->assignment_ids),
            'schedule' => $request->schedule,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'price' => $request->price,
            'level' => $request->level,
            'status' => 'draft', // Changed to draft until tutor accepts
            'tutor_status' => 'pending', // New column from migration
            'created_by' => auth()->id()
        ]);

        // Assign the selected assignments to this class
        StudentTutorAssignment::whereIn('id', $request->assignment_ids)
            ->update([
                'class_id' => $class->id,
                'status' => 'pending' // Changed from 'active' to 'pending'
            ]);

        // 🆕 NEW: Send notification to tutor
        $this->sendClassNotification($class, $tutor);

        // Load relationships
        $class->load(['course', 'tutor', 'assignments.student', 'assignments.tutor', 'assignments.course']);

        return response()->json([
            'success' => true,
            'message' => 'Class created successfully. Tutor has been notified and must accept the class.',
            'note' => 'Class status: draft (will be upcoming when tutor accepts)',
            'data' => $class
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to create class from assignments',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Add assignments to an existing class
 */
public function addAssignments(Request $request, $classId)
{
    $request->validate([
        'assignment_ids' => 'required|array',
        'assignment_ids.*' => 'exists:student_tutor_assignments,id'
    ]);

    try {
        $class = ClassRoom::findOrFail($classId);
        
        // Check if class has capacity
        $newCount = count($request->assignment_ids);
        if ($class->current_enrollment + $newCount > $class->max_capacity) {
            return response()->json([
                'success' => false,
                'message' => 'Class capacity exceeded. Max capacity: ' . $class->max_capacity
            ], 422);
        }

        // Check if assignments match class course and tutor
        $assignments = StudentTutorAssignment::whereIn('id', $request->assignment_ids)->get();
        
        foreach ($assignments as $assignment) {
            if ($assignment->course_id !== $class->course_id || $assignment->tutor_id !== $class->tutor_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Assignments must match the class course and tutor'
                ], 422);
            }
            
            if ($assignment->class_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some assignments are already assigned to a class'
                ], 422);
            }
        }

        // Update assignments
        StudentTutorAssignment::whereIn('id', $request->assignment_ids)
            ->update([
                'class_id' => $class->id,
                'status' => 'active'
            ]);

        // Update class enrollment count
        $class->update([
            'current_enrollment' => $class->current_enrollment + $newCount
        ]);

        return response()->json([
            'success' => true,
            'message' => $newCount . ' student(s) added to class successfully'
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to add assignments to class',
            'error' => $e->getMessage()
        ], 500);
    }
}
// In ClassRoomController.php
public function removeAssignment($classId, $assignmentId)
{
    try {
        $class = ClassRoom::findOrFail($classId);
        $assignment = StudentTutorAssignment::findOrFail($assignmentId);
        
        if ($assignment->class_id !== $class->id) {
            return response()->json([
                'success' => false,
                'message' => 'Assignment does not belong to this class'
            ], 422);
        }
        
        $assignment->update([
            'class_id' => null,
            'status' => 'active'
        ]);
        
        // Update class enrollment count
        $class->decrement('current_enrollment');
        
        return response()->json([
            'success' => true,
            'message' => 'Student removed from class successfully'
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to remove student from class',
            'error' => $e->getMessage()
        ], 500);
    }
}

private function sendClassNotification($class, $tutor)
{
    try {
        $course = Course::find($class->course_id);
        $admin = auth()->user();

        DB::table('messages')->insert([
            'sender_id' => $admin->id,
            'receiver_id' => $tutor->id,
            'message' => "🏫 New Class Assignment\nClass: {$class->title}\nCourse: {$course->title}\nBatch: {$class->batch_name}\nSchedule: {$class->schedule}\nStudents: {$class->current_enrollment}/{$class->max_capacity}\n\nPlease accept or reject this class in your dashboard.",
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Update notified timestamp
        DB::table('classes')
            ->where('id', $class->id)
            ->update(['notified_tutor_at' => now()]);

    } catch (\Exception $e) {
        \Log::error('Failed to send class notification: ' . $e->getMessage());
    }
}

}