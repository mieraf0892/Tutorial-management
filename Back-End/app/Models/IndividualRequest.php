<?php
// app/Models/IndividualRequest.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IndividualRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'course_id',
        'tutor_id',
        'special_requirements',
        'preferred_hours_per_week',
        'preferred_schedule',
        'preferred_start_date',
        'duration_weeks',
        'hourly_rate',
        'total_price',
        'status',
        'admin_notes',
        'tutor_notes',
    ];

    protected $casts = [
        'preferred_schedule' => 'array',
        'preferred_start_date' => 'date',
        'hourly_rate' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_REVIEWING = 'reviewing';
    const STATUS_SEARCHING = 'searching';
    const STATUS_MATCHED = 'matched';
    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_ONGOING = 'ongoing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REJECTED = 'rejected';

    public static function getStatuses()
    {
        return [
            self::STATUS_PENDING => 'Pending',
            self::STATUS_REVIEWING => 'Reviewing',
            self::STATUS_SEARCHING => 'Searching for Tutor',
            self::STATUS_MATCHED => 'Tutor Matched',
            self::STATUS_SCHEDULED => 'Scheduled',
            self::STATUS_ONGOING => 'Ongoing',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
            self::STATUS_REJECTED => 'Rejected',
        ];
    }

    // Relationships
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [
            self::STATUS_PENDING,
            self::STATUS_REVIEWING,
            self::STATUS_SEARCHING,
            self::STATUS_MATCHED,
            self::STATUS_SCHEDULED,
            self::STATUS_ONGOING,
        ]);
    }

    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeByTutor($query, $tutorId)
    {
        return $query->where('tutor_id', $tutorId);
    }

    public function scopeByCourse($query, $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    // Helper methods
    public function calculateTotalPrice()
    {
        $totalHours = $this->preferred_hours_per_week * $this->duration_weeks;
        return $totalHours * ($this->hourly_rate ?: $this->course->price_individual ?: 0);
    }

    public function isAssignable()
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_REVIEWING, self::STATUS_SEARCHING]);
    }
}