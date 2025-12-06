<?php
// database/seeders/TutorialSessionSeeder.php

namespace Database\Seeders;

use App\Models\Tutorial;
use App\Models\User;
use App\Models\TutorialSession;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class TutorialSessionSeeder extends Seeder
{
    public function run()
    {
        $tutorials = Tutorial::all();
        $tutors = User::where('role', 'tutor')->get();

        if ($tutorials->isEmpty() || $tutors->isEmpty()) {
            $this->command->info('No tutorials or tutors found. Please seed tutorials and tutors first.');
            return;
        }

        $sessionTitles = [
            'Introduction Session',
            'Weekly Live Class',
            'Q&A Session',
            'Practice Workshop',
            'Project Review',
            'Advanced Topics',
            'Exam Preparation',
            'Final Review'
        ];

        foreach ($tutorials as $tutorial) {
            $sessionCount = rand(4, 8);
            
            for ($i = 1; $i <= $sessionCount; $i++) {
                $startTime = Carbon::now()->subDays(rand(1, 60))->setHour(rand(9, 17))->setMinute(0);
                $endTime = (clone $startTime)->addHours(1)->addMinutes(30);
                
                TutorialSession::create([
                    'tutorial_id' => $tutorial->id,
                    'tutor_id' => $tutors->random()->id,
                    'title' => $sessionTitles[array_rand($sessionTitles)] . " #{$i}",
                    'description' => "Weekly session for {$tutorial->title} covering important topics.",
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'meeting_link' => 'https://meet.google.com/' . substr(md5($tutorial->title . $i), 0, 10),
                    'status' => 'completed',
                    'session_type' => 'live_session',
                    'duration_minutes' => 90,
                    'notes' => 'Regular weekly session with student interactions.'
                ]);
            }
        }

        $this->command->info("Created {$sessionCount} tutorial sessions for each tutorial.");
    }
}