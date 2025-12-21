<?php
// app/Models/Tutorial.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tutorial extends Model
{
    use HasFactory;

    protected $fillable = [
        'tutor_id',
        'title',
        'description',
        'category_id',
        'duration',
        'enrollment_count', // CHANGED from 'students'
        'rating',
        'level',
        'image',
        'content',
        'instructor',
        'price',
        'is_published',
        'is_free', // ADD THIS
        'has_preview', // ADD THIS
        'preview_description', // ADD THIS
        'preview_video_url', // ADD THIS
        'preview_lessons_count', // ADD THIS
        'instructor_bio',
        'instructor_experience',
        'learning_objectives',
        'includes',
        'created_by_role',
        'admin_id',
        'status',
        'approved_by_admin_id',
        'approved_at',
        'rejection_reason'
    ];

    protected $casts = [
        'rating' => 'decimal:1',
        'price' => 'decimal:2',
        'is_published' => 'boolean',
        'is_free' => 'boolean',
        'has_preview' => 'boolean',
        'learning_objectives' => 'array',
        'includes' => 'array',
        'approved_at' => 'datetime'
    ];

    // Relationship with tutor
    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    // Relationship with category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Relationship with lessons
    public function lessons()
    {
        return $this->hasMany(Lesson::class)->orderBy('order');
    }

    // Relationship with enrollments
    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    // Relationship with enrolled students (now no conflict!)
    public function students()
    {
        return $this->belongsToMany(User::class, 'enrollments', 'tutorial_id', 'user_id')
                    ->where('users.role', 'student')
                    ->withPivot('status', 'completed_at');
    }

    // Get total lessons count
    public function getTotalLessonsAttribute()
    {
        return $this->lessons()->count();
    }

    // Get real students count from enrollments
    public function getRealStudentsCountAttribute()
    {
        return $this->enrollments()->count();
    }

    // This is now safe to use - no conflict!
    public function getEnrollmentCountAttribute()
    {
        return $this->enrollments()->count();
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
    
    /**
     * Get the admin who approved this tutorial
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by_admin_id');
    }
    
    /**
     * Get all assignments for this tutorial
     */
    public function assignments()
    {
        return $this->hasMany(TutorialAssignment::class);
    }
    
    /**
     * Get assigned tutors through assignments
     */
    public function assignedTutors()
    {
        return $this->belongsToMany(User::class, 'tutorial_assignments', 'tutorial_id', 'tutor_id')
                    ->withPivot(['status', 'accepted_at', 'rejected_at', 'rejection_reason'])
                    ->withTimestamps();
    }
    
    /**
     * Scope for published tutorials
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
    
    /**
     * Scope for tutorials needing approval
     */
    public function scopePendingApproval($query)
    {
        return $query->where('status', 'pending_approval');
    }
    
    /**
     * Scope for drafts
     */
    public function scopeDrafts($query)
    {
        return $query->where('status', 'draft');
    }
    
    /**
     * Check if tutorial is published
     */
    public function isPublished()
    {
        return $this->status === 'published';
    }
    
    /**
     * Check if tutorial needs approval
     */
    public function needsApproval()
    {
        return $this->status === 'pending_approval';
    }
    
    /**
     * Check if tutorial is a draft
     */
    public function isDraft()
    {
        return $this->status === 'draft';
    }

    // Add these methods to Tutorial.php
public function isInProgress()
{
    return $this->status === 'in_progress';
}

public function isAssigned()
{
    // Check if tutorial has any assignments
    return $this->assignments()->exists();
}

public function getCurrentAssignment()
{
    return $this->assignments()->where('status', 'accepted')->first();
}

public function getPendingAssignments()
{
    return $this->assignments()->where('status', 'pending')->get();
}

public function canBePublished()
{
    // Tutorial can be published if:
    // 1. It's approved (for tutor-created)
    // 2. OR it's completed content (for admin-assigned)
    return $this->status === 'approved' || $this->status === 'completed';
}

public function markAsCompleted()
{
    // When tutor finishes content creation
    $this->update(['status' => 'pending_review']);
}

public function markAsInProgress()
{
    // When tutor accepts assignment
    $this->update(['status' => 'in_progress']);
}
}