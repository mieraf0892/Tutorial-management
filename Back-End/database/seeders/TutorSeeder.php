<?php
// database/seeders/TutorSeeder.php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TutorSeeder extends Seeder
{
    public function run()
    {
        // Check if tutors already exist
        if (User::where('role', 'tutor')->count() > 0) {
            $this->command->info('Tutors already exist.');
            return;
        }

        $tutors = [
            [
                'name' => 'Dr. Sarah Johnson',
                'email' => 'sarah.johnson@university.edu',
                'role' => 'tutor',
                'password' => Hash::make('password123'),
            ],
            [
                'name' => 'Prof. Michael Chen',
                'email' => 'michael.chen@university.edu', 
                'role' => 'tutor',
                'password' => Hash::make('password123'),
            ],
            [
                'name' => 'Dr. Emily Davis',
                'email' => 'emily.davis@university.edu',
                'role' => 'tutor',
                'password' => Hash::make('password123'),
            ]
        ];

        foreach ($tutors as $tutor) {
            User::create($tutor);
        }

        $this->command->info('Created 3 tutor users.');
    }
}