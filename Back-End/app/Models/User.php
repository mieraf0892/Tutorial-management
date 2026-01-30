<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'phone', 'status',
        'suspended_at', 'email_verification_token', 'last_login_at', 'profile_photo'
    ];

    protected $hidden = [
        'password', 'remember_token', 'email_verification_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'suspended_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relationships
    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function tutor()
    {
        return $this->hasOne(Tutor::class, 'user_id');
    }

    public function institutions()
    {
        return $this->hasMany(UserInstitution::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function lessonCompletions()
    {
        return $this->hasMany(LessonCompletion::class);
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class, 'admin_id');
    }

     
    public function createdTemplates()
    {
        return $this->hasMany(AnnouncementTemplate::class, 'created_by');
    }

    public function usedTemplates()
    {
        return $this->belongsToMany(AnnouncementTemplate::class, 'template_usage', 'admin_id', 'template_id')
            ->withPivot('used_at')
            ->withTimestamps();
    }

    /**
     * Check if email is verified
     */
    public function isEmailVerified(): bool
    {
        return !is_null($this->email_verified_at);
    }

    /**
     * Check if account is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if account is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if account is suspended
     */
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * Check if account is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if student can login
     */
    public function canStudentLogin(): bool
    {
        return $this->isStudent() && $this->isEmailVerified() && $this->isActive();
    }

    /**
     * Check if tutor can login
     */
    public function canTutorLogin(): bool
    {
        return $this->isTutor() && $this->isEmailVerified() && $this->isActive();
    }

    /**
     * Check if profile is completed
     */
    public function isProfileCompleted(): bool
    {
        if ($this->isStudent()) {
            return $this->student()->exists();
        }
        
        if ($this->isTutor()) {
            return $this->tutor()->exists();
        }
        
        return true; // Admin/Staff don't need profile
    }

    /**
     * Get the appropriate profile
     */
    public function profile()
    {
        if ($this->isStudent()) {
            return $this->student;
        }
        
        if ($this->isTutor()) {
            return $this->tutor;
        }
        
        return null;
    }

    // Role checking methods
    public function isSuperAdmin()
    {
        return $this->role === 'super_admin';
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'super_admin', 'user_admin']);
    }

    public function isStaff()
    {
        return $this->role === 'staff';
    }

    public function isTutor()
    {
        return $this->role === 'tutor';
    }

    public function isStudent()
    {
        return $this->role === 'student';
    }

    public function hasRole($role)
    {
        return $this->role === $role;
    }

    public function getRoleDisplayName()
    {
        return match($this->role) {
            'super_admin' => 'Super Administrator',
            'admin' => 'Administrator',
            'staff' => 'Staff',
            'tutor' => 'Tutor',
            'student' => 'Student',
            default => ucfirst($this->role)
        };
    }

    // Check institution-specific roles
    public function getInstitutionRoles($institutionId = null)
    {
        $query = $this->institutions()->where('is_active', true);
        
        if ($institutionId) {
            $query->where('institution_id', $institutionId);
        }
        
        return $query->pluck('role')->toArray();
    }

    public function canAccessAdmin()
    {
        return $this->isSuperAdmin() || $this->isAdmin();
    }

    public function createdTutorials()
{
    if ($this->role === 'tutor') {
        return $this->hasMany(Tutorial::class, 'tutor_id');
    }
    return null;
}

/**
 * Get tutorials assigned to this tutor
 */
public function assignedTutorials()
{
    if ($this->role === 'tutor') {
        return $this->belongsToMany(Tutorial::class, 'tutorial_assignments', 'tutor_id', 'tutorial_id')
                    ->withPivot(['status', 'accepted_at', 'rejected_at', 'rejection_reason'])
                    ->withTimestamps();
    }
    return null;
}

/**
 * Get assignments for this tutor
 */
public function tutorialAssignments()
{
    if ($this->role === 'tutor') {
        return $this->hasMany(TutorialAssignment::class, 'tutor_id');
    }
    return null;
}

/**
 * Get tutorials created by this admin
 */
public function adminCreatedTutorials()
{
    if (in_array($this->role, ['admin', 'super_admin'])) {
        return $this->hasMany(Tutorial::class, 'admin_id');
    }
    return null;
}

/**
 * Get tutorials approved by this admin
 */
public function approvedTutorials()
{
    if (in_array($this->role, ['admin', 'super_admin'])) {
        return $this->hasMany(Tutorial::class, 'approved_by_admin_id');
    }
    return null;
}

// Inside the User class
public function payments()
{
    return $this->hasMany(Payment::class);
}}