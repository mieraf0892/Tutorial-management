<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiveSession extends Model
{
    protected $fillable = [
        'tutor_id', 'tutorial_id', 'course_id', 'title', 'description',
        'start_time', 'duration_minutes', 'jitsi_room_name', 'meeting_url', 'status'
    ];

    protected $casts = [
        'start_time' => 'datetime',
    ];

    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function tutorial()
    {
        return $this->belongsTo(Tutorial::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    // Generate Jitsi room name (simple example)
    public static function generateRoomName()
    {
        return Str::random(10) . '-' . time();
    }

    // Generate full Jitsi URL (use your Jitsi server)
    public function getMeetingUrlAttribute($value)
    {
        $base = config('app.jitsi_domain', 'meet.jit.si'); // put in config or .env
        return $value ?? "https://{$base}/{$this->jitsi_room_name}";
    }
}
