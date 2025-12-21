<?php

namespace App\Services;

use App\Models\Enrollment;

class EnrollmentService
{
    public function createPending(int $userId, int $tutorialId): Enrollment
    {
        return Enrollment::create([
            'user_id'     => $userId,
            'tutorial_id' => $tutorialId,
            'status'      => 'pending',
        ]);
    }

    public function activate(int $enrollmentId): Enrollment
    {
        $enrollment = Enrollment::findOrFail($enrollmentId);
        
        $enrollment->update([
            'status'       => 'active',
            'activated_at' => now(),
        ]);

        // Increment tutorial enrollment count
        $enrollment->tutorial()->increment('enrollment_count');

        return $enrollment;
    }

    public function cancel(int $enrollmentId): Enrollment
    {
        $enrollment = Enrollment::findOrFail($enrollmentId);
        
        $enrollment->update([
            'status' => 'cancelled',
        ]);

        return $enrollment;
    }

    public function complete(int $enrollmentId): Enrollment
    {
        $enrollment = Enrollment::findOrFail($enrollmentId);
        
        $enrollment->update([
            'status'       => 'completed',
            'completed_at' => now(),
        ]);

        return $enrollment;
    }

    public function getUserEnrollments(int $userId, string $status = null)
    {
        $query = Enrollment::where('user_id', $userId)
            ->with('tutorial');
            
        if ($status) {
            $query->where('status', $status);
        }
        
        return $query->orderBy('created_at', 'desc')->get();
    }
}