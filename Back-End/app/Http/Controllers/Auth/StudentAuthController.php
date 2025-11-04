<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentLearningPreference;
use App\Models\StudentCourseDetail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StudentAuthController extends Controller
{
    public function register(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            // User data
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            
            // Student personal information
            'fatherName' => 'required|string|max:255',
            'age' => 'required|integer|min:1|max:100',
            'parentEmail' => 'required_if:age,<,15|email|nullable',
            'sex' => 'required|in:male,female',
            'country' => 'required|string',
            'phoneCode' => 'required|string',
            'phone' => 'required|string',
            'city' => 'nullable|string',
            'subcity' => 'nullable|string',
            'address' => 'required|string',
            
            // Course type
            'courseType' => 'required|in:Programming,Language,School Grades,Entrance Preparation',
            
            // Learning preferences
            'learningPreference' => 'required|in:Individual,Group',
            'studyDays' => 'required|array',
            'studyDays.*' => 'string',
            'hoursPerDay' => 'required|in:1,2,3,4',
            
            // Conditional validations
            'learningMode' => 'required_if:city,Addis Ababa|in:Online,Home to Home|nullable',
            
            // Course-specific validations
            'selectedArea' => 'required_if:courseType,Programming|array|nullable',
            'selectedLanguages' => 'required_if:courseType,Language|array|nullable',
            'selectedGrade' => 'required_if:courseType,School Grades|string|nullable',
            'selectedCurriculum' => 'required_if:courseType,School Grades|in:national,international|nullable',
            'selectedSubjects' => 'required_if:courseType,School Grades|array|nullable',
            'selectedExam' => 'required_if:courseType,Entrance Preparation|string|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Start database transaction
        DB::beginTransaction();

        try {
            // Create User
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'student',
                'phone' => $request->phone,
            ]);

            // Create Student
            $student = Student::create([
                'user_id' => $user->id,
                'father_name' => $request->fatherName,
                'age' => $request->age,
                'parent_email' => $request->parentEmail,
                'sex' => $request->sex,
                'country' => $request->country,
                'phone_code' => $request->phoneCode,
                'city' => $request->city,
                'subcity' => $request->subcity,
                'address' => $request->address,
                'course_type' => $request->courseType,
            ]);

            // Create Learning Preferences
            StudentLearningPreference::create([
                'student_id' => $student->id,
                'learning_mode' => $request->learningMode,
                'learning_preference' => $request->learningPreference,
                'study_days' => $request->studyDays,
                'hours_per_day' => $request->hoursPerDay,
            ]);

            // Create Course Details based on course type
            $this->saveCourseDetails($student->id, $request);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Student registered successfully!',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function saveCourseDetails($studentId, $request)
    {
        $courseType = $request->courseType;
        
        switch ($courseType) {
            case 'Programming':
                foreach ($request->selectedArea as $area) {
                    StudentCourseDetail::create([
                        'student_id' => $studentId,
                        'field_type' => 'programming_area',
                        'field_value' => $area
                    ]);
                }
                break;
                
            case 'Language':
                foreach ($request->selectedLanguages as $language) {
                    StudentCourseDetail::create([
                        'student_id' => $studentId,
                        'field_type' => 'selected_language',
                        'field_value' => $language
                    ]);
                }
                break;
                
            case 'School Grades':
                // Save grade
                StudentCourseDetail::create([
                    'student_id' => $studentId,
                    'field_type' => 'grade',
                    'field_value' => $request->selectedGrade
                ]);
                
                // Save curriculum
                StudentCourseDetail::create([
                    'student_id' => $studentId,
                    'field_type' => 'curriculum',
                    'field_value' => $request->selectedCurriculum
                ]);
                
                // Save subjects
                foreach ($request->selectedSubjects as $subject) {
                    StudentCourseDetail::create([
                        'student_id' => $studentId,
                        'field_type' => 'subject',
                        'field_value' => $subject
                    ]);
                }
                break;
                
            case 'Entrance Preparation':
                StudentCourseDetail::create([
                    'student_id' => $studentId,
                    'field_type' => 'exam',
                    'field_value' => $request->selectedExam
                ]);
                break;
        }
    }
}