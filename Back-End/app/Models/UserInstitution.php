<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserInstitution extends Model
{
    protected $fillable = [
        'user_id', 'institution_id', 'role', 'is_active', 'assigned_by'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public $timestamps = true;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}