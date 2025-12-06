<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TemplateUsage extends Model
{
    use HasFactory;

    protected $table = 'template_usage';

    protected $fillable = [
        'template_id',
        'admin_id',
        'used_at'
    ];

    protected $casts = [
        'used_at' => 'datetime'
    ];

    /**
     * Relationship to the template
     */
    public function template()
    {
        return $this->belongsTo(AnnouncementTemplate::class, 'template_id');
    }

    /**
     * Relationship to the admin who used the template
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}