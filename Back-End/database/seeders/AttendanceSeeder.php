<?php
// database/seeders/AttendanceSeeder.php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\TutorialSession;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AttendanceSeeder extends Seeder
{
    public function run()
    {
        $students = User::where('role', 'student')->get();
        $tutorialSessions = TutorialSession::all();

        if ($students->isEmpty() || $tutorialSessions->isEmpty()) {
            $this->command->info('No students or tutorial sessions found. Please seed them first.');
            return;
        }

        $attendanceCount = 0;

        foreach ($students as $student) {
            foreach ($tutorialSessions as $session) {
                // 80% chance of having attendance record for this session
                if (rand(1, 100) <= 80) {
                    $status = $this->getRandomStatus();
                    $duration = $status === 'absent' ? 0 : ($status === 'late' ? rand(30, 75) : $session->duration_minutes);
                    
                    Attendance::create([
                        'user_id' => $student->id,
                        'tutorial_id' => $session->tutorial_id,
                        'tutorial_session_id' => $session->id,
                        'session_date' => $session->start_time,
                        'status' => $status,
                        'duration_minutes' => $duration,
                        'instructor_notes' => $this->getInstructorNotes($status),
                        'session_type' => $session->session_type,
                    ]);
                    
                    $attendanceCount++;
                }
            }
        }

        $this->command->info("Created {$attendanceCount} attendance records.");
    }

    private function getRandomStatus()
    {
        $statuses = [
            'present' => 70, // 70% chance
            'late' => 15,    // 15% chance  
            'absent' => 10,  // 10% chance
            'excused' => 5   // 5% chance
        ];

        $random = rand(1, 100);
        $current = 0;

        foreach ($statuses as $status => $probability) {
            $current += $probability;
            if ($random <= $current) {
                return $status;
            }
        }

        return 'present';
    }

    private function getInstructorNotes($status)
    {
        $notes = [
            'present' => [
                'Active participation in class',
                'Completed all exercises successfully',
                'Asked relevant questions',
                'Good engagement with the material',
                'Helped other students',
                'Excellent performance today'
            ],
            'late' => [
                'Joined 15 minutes late due to traffic',
                'Technical issues at the start',
                'Internet connection problems',
                'Joined after break',
                'Family emergency caused delay'
            ],
            'absent' => [
                'Notified in advance about absence',
                'Medical appointment',
                'Family emergency',
                'No notification provided',
                'Technical issues prevented joining'
            ],
            'excused' => [
                'Pre-approved absence for personal reasons',
                'University exam conflict',
                'Official university event',
                'Medical leave',
                'Family emergency'
            ]
        ];

        return $notes[$status][array_rand($notes[$status])];
    }
}