<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TutorialAssignment extends Model
{
    protected $fillable = [
        'tutorial_id',
        'tutor_id',
        'assigned_by_admin_id',
        'status',
        'accepted_at',
        'rejected_at',
        'rejection_reason'
    ];
    
    protected $casts = [
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];
    
    /**
     * Get the tutorial
     */
    public function tutorial()
    {
        return $this->belongsTo(Tutorial::class);
    }
    
    /**
     * Get the assigned tutor
     */
    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }
    
    /**
     * Get the admin who made the assignment
     */
    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by_admin_id');
    }
    
    /**
     * Scope for pending assignments
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
    
    /**
     * Scope for accepted assignments
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }
    
    /**
     * Accept this assignment
     */
    public function accept()
    {
        return $this->update([
            'status' => 'accepted',
            'accepted_at' => now(),
            'rejected_at' => null,
            'rejection_reason' => null
        ]);
    }
    
    /**
     * Reject this assignment
     */
    public function reject($reason = null)
    {
        return $this->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejection_reason' => $reason,
            'accepted_at' => null
        ]);
    }
    
    /**
     * Check if assignment is accepted
     */
    public function isAccepted()
    {
        return $this->status === 'accepted';
    }
    
    /**
     * Check if assignment is pending
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }
}