<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    /**
     * Calculate price with selected course
     */
    public function getPaymentStatus(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Load student with relations
            $student = $user->student()->with(['learningPreferences', 'courseDetails'])->first();

            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student not found'], 404);
            }

            $prefs = $student->learningPreferences;
            $details = $student->courseDetails;

            // 1. Check if student has selected a course
            if (!$student->selected_course_id) {
                return response()->json([
                    'success' => true,
                    'is_paid' => (bool)$student->is_paid,
                    'amount_due' => 0, // No course selected yet
                    'requires_course_selection' => true,
                    'currency' => 'ETB',
                    'message' => 'Please select a course to calculate price'
                ]);
            }

            // 2. Get the selected course with prices
            $course = Course::find($student->selected_course_id);
            if (!$course) {
                return response()->json(['success' => false, 'message' => 'Selected course not found'], 404);
            }

            // 3. Get the correct hourly rate based on preference
            $hourlyRate = 0;
            $rateType = 'Group'; // default
            
            if ($prefs) {
                $rateType = $prefs->learning_preference;
                if ($rateType === 'Individual') {
                    $hourlyRate = $course->price_individual ?? 0;
                } else {
                    $hourlyRate = $course->price_group ?? 0;
                }
            } else {
                $hourlyRate = $course->price_group ?? 0;
            }

            if ($hourlyRate <= 0) {
                return response()->json(['success' => false, 'message' => 'Course price not set'], 400);
            }

            // 4. SPECIAL PREMIUMS (Curriculum & Exams)
            $premiumMarkup = 1.0; 
            $examFees = 0;
            
            foreach ($details as $detail) {
                if ($detail->field_type === 'selectedCurriculum' && $detail->field_value === 'international') {
                    $premiumMarkup = 1.2; // 20% increase
                }
                if ($detail->field_type === 'selectedExam' && in_array($detail->field_value, ['SAT', 'IELTS', 'TOEFL'])) {
                    $examFees += 50; // Exam fee per exam
                }
            }

            // 5. PREFERENCE & MODE
            $modeExtra = 0;
            $hours = 1;
            $daysCount = 1;

            if ($prefs) {
                $modeExtra = ($prefs->learning_mode === 'Home to Home') ? 150 : 0;
                $hours = (int)($prefs->hours_per_day ?: 1);
                $daysCount = (int)($prefs->study_days ?: 1);
            }

            // 6. THE CORRECT FORMULA
            $rateWithMode = $hourlyRate + $modeExtra;
            $weeklyHours = $hours * $daysCount;
            $monthlyHours = $weeklyHours * 4; // 4 weeks per month
            
            // Base monthly fee
            $monthlyFee = $rateWithMode * $monthlyHours;
            
            // Apply premium markup
            $totalAmount = $monthlyFee * $premiumMarkup;
            
            // Add exam fees
            $totalAmount += $examFees;

            // 7. SAVE TOTAL TO DATABASE
            $student->final_price = round($totalAmount, 2);
            $student->save();

            return response()->json([
                'success' => true,
                'is_paid' => (bool)$student->is_paid,
                'amount_due' => $student->final_price,
                'currency' => 'ETB',
                'selected_course' => [
                    'id' => $course->id,
                    'title' => $course->title,
                    'category' => $course->category,
                    'subcategory' => $course->subcategory,
                    'hourly_rate' => $hourlyRate,
                    'rate_type' => $rateType
                ],
                'summary' => [
                    'course' => $student->course_type,
                    'learning_preference' => $prefs->learning_preference ?? 'Group',
                    'learning_mode' => $prefs->learning_mode ?? 'Online',
                    'days_per_week' => $daysCount,
                    'hours_per_day' => $hours,
                    'weekly_hours' => $weeklyHours,
                    'monthly_hours' => $monthlyHours,
                    'premium_markup' => $premiumMarkup,
                    'mode_extra' => $modeExtra,
                    'exam_fees' => $examFees
                ],
                'calculation_breakdown' => [
                    'hourly_rate' => $hourlyRate,
                    'mode_extra' => $modeExtra,
                    'rate_with_mode' => $rateWithMode,
                    'weekly_hours' => $weeklyHours,
                    'monthly_hours' => $monthlyHours,
                    'monthly_fee' => $monthlyFee,
                    'after_premium' => $monthlyFee * $premiumMarkup,
                    'after_exam_fees' => $totalAmount
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * API to update selected course
     */
    public function updateSelectedCourse(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'course_id' => 'required|integer|exists:courses,id'
            ]);

            $user = Auth::user();
            $student = $user->student()->first();

            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student not found'], 404);
            }

            // Get the course to validate it exists and is active
            $course = Course::find($request->course_id);
            if (!$course) {
                return response()->json(['success' => false, 'message' => 'Course not found'], 404);
            }

            if (!$course->is_active) {
                return response()->json(['success' => false, 'message' => 'This course is not available'], 400);
            }

            // Update selected course
            $student->selected_course_id = $request->course_id;
            $student->save();

            // Recalculate price with new course
            $this->recalculatePrice($student);

            return response()->json([
                'success' => true,
                'message' => 'Course selected successfully',
                'course_id' => $student->selected_course_id,
                'course_title' => $course->title,
                'recalculated' => true
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Helper method to recalculate price
     */
    private function recalculatePrice(Student $student): void
    {
        // This will be called when we get payment status
        // Price will be recalculated in getPaymentStatus()
    }

    /**
     * Get available courses for selection
     */
    public function getAvailableCourses(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $student = $user->student()->first();

            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Student not found'], 404);
            }

            // Get courses based on student's course type
            $categoryMap = [
                'Programming' => 'programming',
                'Language' => 'languages',
                'School Grades' => 'school-grades',
                'Entrance Preparation' => 'entrance-exams'
            ];

            $category = $categoryMap[$student->course_type] ?? null;

            $query = Course::where('is_active', true);

            if ($category) {
                $query->where('category', $category);
            }

            $courses = $query->select([
                'id', 'title', 'description', 'category', 'subcategory',
                'price_individual', 'price_group', 'duration_hours'
            ])->get();

            return response()->json([
                'success' => true,
                'courses' => $courses,
                'selected_course_id' => $student->selected_course_id
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}