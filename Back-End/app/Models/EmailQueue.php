<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailQueue extends Model
{
    use HasFactory;

    protected $table = 'email_queues';

    protected $fillable = [
        'user_id', 'type', 'to', 'subject', 'content', 'token', 'verification_url', 'sent_at', 'viewed_at', 'is_verification',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'viewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function markAsViewed()
    {
        $this->viewed_at = now();
        $this->save();
    }
    
    public function getVerificationUrlAttribute()
    {
        if ($this->type === 'verification' && $this->token) {
            return url('/api/verify-email/' . $this->token);
        }
        return null;
    }
}