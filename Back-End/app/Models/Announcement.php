<?php
// app/Models/Announcement.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'title',
        'message',
        'priority',
        'target_type',
        'target_roles',
        'target_users',
        'target_filters',
        'send_at',
        'is_sent',
        'sent_at',
        'estimated_recipients',
        'actual_recipients',
    ];

    protected $casts = [
        'target_roles' => 'array',
        'target_users' => 'array',
        'target_filters' => 'array',
        'send_at' => 'datetime',
        'sent_at' => 'datetime',
        'is_sent' => 'boolean',
    ];

    /**
     * Get the admin who created this announcement
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Scope for pending announcements (not sent yet)
     */
    public function scopePending($query)
    {
        return $query->where('is_sent', false);
    }

    /**
     * Scope for scheduled announcements ready to be sent
     */
    public function scopeReadyToSend($query)
    {
        return $query->pending()
                    ->where(function ($q) {
                        $q->whereNull('send_at')
                          ->orWhere('send_at', '<=', now());
                    });
    }

    /**
     * Check if announcement should be sent now
     */
    public function shouldBeSent(): bool
    {
        return !$this->is_sent && (!$this->send_at || $this->send_at->lte(now()));
    }
}