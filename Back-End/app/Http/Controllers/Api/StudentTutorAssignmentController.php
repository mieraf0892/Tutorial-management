<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentTutorAssignment;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class StudentTutorAssignmentController extends Controller
{
    /**
     * Get all student-tutor assignments
     */
    public function index()
    {
        try {
            $assignments = StudentTutorAssignment::with(['course', 'tutor', 'student'])
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Assignments retrieved successfully',
                'data' => $assignments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve assignments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new student-tutor assignment(s) - MODIFIED FOR TUTOR ACCEPTANCE
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
            'tutor_id' => 'required|exists:users,id,role,tutor',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id,role,student',
            'start_date' => 'nullable|date',
            'weekly_hours' => 'nullable|integer|min:1|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $course = Course::findOrFail($request->course_id);
            $tutor = User::findOrFail($request->tutor_id);

            // Check if tutor is assigned to this course
            if (!$course->tutors->contains($tutor->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tutor is not assigned to this course. Please assign tutor to course first.'
                ], 422);
            }

            $createdAssignments = [];
            $errors = [];

            foreach ($request->student_ids as $studentId) {
                try {
                    // Check if assignment already exists
                    $existing = StudentTutorAssignment::where([
                        'course_id' => $request->course_id,
                        'tutor_id' => $request->tutor_id,
                        'student_id' => $studentId
                    ])->first();

                    if ($existing) {
                        $errors[] = "Student ID {$studentId} is already assigned to this tutor for this course";
                        continue;
                    }

                    // 🆕 NEW: Create assignment with pending tutor status
                    $assignment = StudentTutorAssignment::create([
                        'course_id' => $request->course_id,
                        'tutor_id' => $request->tutor_id,
                        'student_id' => $studentId,
                        'start_date' => $request->start_date ?? now(),
                        'weekly_hours' => $request->weekly_hours ?? 2,
                        'status' => 'pending', // Changed from 'active' to 'pending'
                        'tutor_status' => 'pending', // New column from migration
                        'notified_tutor_at' => now() // New column from migration
                    ]);

                    // 🆕 NEW: Send notification to tutor
                    $this->sendAssignmentNotification($assignment, $tutor, $studentId);

                    $assignment->load(['course', 'tutor', 'student']);
                    $createdAssignments[] = $assignment;

                } catch (\Exception $e) {
                    $errors[] = "Failed to assign student ID {$studentId}: " . $e->getMessage();
                }
            }

            $response = [
                'success' => true,
                'message' => count($createdAssignments) . ' assignment(s) created successfully',
                'note' => 'Tutor has been notified and must accept the assignment',
                'created_count' => count($createdAssignments),
                'data' => $createdAssignments
            ];

            if (!empty($errors)) {
                $response['warnings'] = $errors;
            }

            return response()->json($response, 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create assignments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🆕 NEW: Send notification to tutor about new assignment
     */
    private function sendAssignmentNotification($assignment, $tutor, $studentId)
    {
        try {
            $student = User::find($studentId);
            $course = Course::find($assignment->course_id);
            
            $admin = auth()->user();

            DB::table('messages')->insert([
                'sender_id' => $admin->id,
                'receiver_id' => $tutor->id,
                'message' => "📚 New Assignment\nCourse: {$course->title}\nStudent: {$student->name}\nWeekly Hours: {$assignment->weekly_hours}\n\nPlease accept or reject this assignment in your dashboard.",
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Optional: Send email notification
            // Mail::to($tutor->email)->send(new TutorAssignmentNotification($assignment, $student, $course));

        } catch (\Exception $e) {
            \Log::error('Failed to send tutor notification: ' . $e->getMessage());
            // Don't fail the whole assignment creation if notification fails
        }
    }

    /**
     * Remove a student-tutor assignment
     */
    public function destroy($id)
    {
        try {
            $assignment = StudentTutorAssignment::find($id);

            if (!$assignment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Assignment not found'
                ], 404);
            }

            $assignment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Assignment removed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove assignment',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}