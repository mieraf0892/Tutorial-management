<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_one',
        'user_two',
        'last_message_id',
    ];

    // ✅ A conversation has many messages
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    // ✅ Optional: get the other participant
    public function otherParticipant($currentUserId)
    {
        return $this->user_one == $currentUserId
            ? $this->user_two
            : $this->user_one;
    }
}
