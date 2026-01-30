<?php
// app/Models/ClassModel.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClassRoom extends Model
{
    use HasFactory, SoftDeletes;

    // Specify the table name to avoid conflict with reserved keyword
    protected $table = 'classes';

    protected $fillable = [
        'title',
        'description',
        'course_id',
        'tutor_id',
        'batch_name',
        'enrollment_code',
        'max_capacity',
        'current_enrollment',
        'schedule',
        'start_date',
        'end_date',
        'price',
        'status',
        'level',
        'learning_objectives',
        'includes',
        'image_url',
    ];

    protected $casts = [
        'learning_objectives' => 'array',
        'includes' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'price' => 'decimal:2',
        'max_capacity' => 'integer',
        'current_enrollment' => 'integer',
    ];

    // Status constants
    const STATUS_DRAFT = 'draft';
    const STATUS_UPCOMING = 'upcoming';
    const STATUS_ONGOING = 'ongoing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    public static function getStatuses()
    {
        return [
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_UPCOMING => 'Upcoming',
            self::STATUS_ONGOING => 'Ongoing',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
        ];
    }

    // Level constants
    const LEVEL_BEGINNER = 'Beginner';
    const LEVEL_INTERMEDIATE = 'Intermediate';
    const LEVEL_ADVANCED = 'Advanced';

    public static function getLevels()
    {
        return [
            self::LEVEL_BEGINNER => 'Beginner',
            self::LEVEL_INTERMEDIATE => 'Intermediate',
            self::LEVEL_ADVANCED => 'Advanced',
        ];
    }

    // Relationships
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'class_id'); // We'll create this later
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['upcoming', 'ongoing']);
    }

    public function scopeByCourse($query, $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    public function scopeByTutor($query, $tutorId)
    {
        return $query->where('tutor_id', $tutorId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Helper methods
    public function isFull()
    {
        return $this->current_enrollment >= $this->max_capacity;
    }

    public function availableSeats()
    {
        return max(0, $this->max_capacity - $this->current_enrollment);
    }

    public function enrollmentPercentage()
    {
        if ($this->max_capacity == 0) return 0;
        return ($this->current_enrollment / $this->max_capacity) * 100;
    }

    // app/Models/ClassRoom.php
public function assignments()
{
    return $this->hasMany(StudentTutorAssignment::class, 'class_id');
}
}