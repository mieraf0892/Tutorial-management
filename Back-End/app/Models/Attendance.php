<?php
// app/Models/Attendance.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tutorial_id',
        'tutorial_session_id',
        'session_date',
        'status',
        'duration_minutes',
        'instructor_notes',
        'session_type'
    ];

    protected $casts = [
        'session_date' => 'datetime',
    ];

    // Status constants for better code readability
    const STATUS_PRESENT = 'present';
    const STATUS_ABSENT = 'absent';
    const STATUS_LATE = 'late';
    const STATUS_EXCUSED = 'excused';

    // Session type constants
    const TYPE_REGULAR = 'regular';
    const TYPE_MAKEUP = 'makeup';
    const TYPE_EXTRA = 'extra';

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tutorial()
    {
        return $this->belongsTo(Tutorial::class);
    }

    public function tutorialSession()
    {
        return $this->belongsTo(TutorialSession::class, 'tutorial_session_id');
    }

    // Consider if you need this - depends on your Student model structure
    public function student()
    {
        return $this->belongsTo(Student::class, 'user_id', 'user_id');
    }

    // Scopes for easy querying
    public function scopePresent($query)
    {
        return $query->where('status', self::STATUS_PRESENT);
    }

    public function scopeAbsent($query)
    {
        return $query->where('status', self::STATUS_ABSENT);
    }

    public function scopeLate($query)
    {
        return $query->where('status', self::STATUS_LATE);
    }

    public function scopeForTutorial($query, $tutorialId)
    {
        return $query->where('tutorial_id', $tutorialId);
    }

    public function scopeForStudent($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('session_date', [$startDate, $endDate]);
    }

    // Helper methods
    public function isPresent()
    {
        return $this->status === self::STATUS_PRESENT;
    }

    public function isAbsent()
    {
        return $this->status === self::STATUS_ABSENT;
    }

    public function isLate()
    {
        return $this->status === self::STATUS_LATE;
    }

    public function isExcused()
    {
        return $this->status === self::STATUS_EXCUSED;
    }
}