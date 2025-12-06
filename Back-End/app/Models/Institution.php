<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Institution extends Model
{
    protected $fillable = [
        'name', 'code', 'address', 'phone', 'email', 'logo_url', 'is_active', 'created_by'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function users()
    {
        return $this->hasMany(UserInstitution::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function activeUsers()
    {
        return $this->users()->where('is_active', true);
    }
}