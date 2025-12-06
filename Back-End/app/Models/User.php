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
        'suspended_at',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relationships
    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function tutor()
    {
        return $this->hasOne(Tutor::class);
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
}