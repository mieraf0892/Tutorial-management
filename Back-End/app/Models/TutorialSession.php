<?php
// app/Models/TutorialSession.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TutorialSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'tutorial_id',
        'tutor_id',
        'title',
        'description',
        'start_time',
        'end_time',
        'meeting_link',
        'status',
        'session_type',
        'duration_minutes',
        'notes'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    // Status constants
    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    // Session type constants
    const TYPE_REGULAR = 'regular';
    const TYPE_MAKEUP = 'makeup';
    const TYPE_EXTRA = 'extra';


    // Relationships
    public function tutorial()
    {
        return $this->belongsTo(Tutorial::class);
    }

    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'tutorial_session_id');
    }

    // Scopes
    public function scopeScheduled($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED)
                    ->where('start_time', '>', now());
    }

    public function scopePast($query)
    {
        return $query->where('start_time', '<', now());
    }

    public function scopeForTutorial($query, $tutorialId)
    {
        return $query->where('tutorial_id', $tutorialId);
    }

    // Helper methods
    public function isUpcoming()
    {
        return $this->status === self::STATUS_SCHEDULED && $this->start_time > now();
    }

    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isCancelled()
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    public function getStudentCountAttribute()
    {
        return $this->tutorial->enrollments()->count();
    }

    public function getAttendanceMarkedAttribute()
    {
        return $this->attendances()->exists();
    }
}