<?php
// app/Jobs/SendAnnouncementJob.php

namespace App\Jobs;

use App\Models\Announcement;
use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendAnnouncementJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $announcement;

    public function __construct(Announcement $announcement)
    {
        $this->announcement = $announcement;
    }

    public function handle()
    {
        try {
            Log::info("Processing announcement: {$this->announcement->id}");

            // Get target users based on announcement configuration
            $users = $this->getTargetUsers();
            
            $sentCount = 0;

            foreach ($users as $user) {
                Message::create([
                    'sender_id' => $this->announcement->admin_id,
                    'receiver_id' => $user->id,
                    'message' => $this->formatAnnouncementMessage(),
                    'is_read' => false,
                    'created_at' => now(),
                ]);
                $sentCount++;
            }

            // Update announcement status
            $this->announcement->update([
                'is_sent' => true,
                'sent_at' => now(),
                'actual_recipients' => $sentCount,
            ]);

            Log::info("Announcement {$this->announcement->id} sent to {$sentCount} users");

        } catch (\Exception $e) {
            Log::error("Failed to send announcement {$this->announcement->id}: " . $e->getMessage());
            throw $e;
        }
    }

    private function getTargetUsers()
    {
        $query = User::query();

        switch ($this->announcement->target_type) {
            case 'all':
                // All active users
                $query->where('status', 'active');
                break;

            case 'roles':
                $roles = $this->announcement->target_roles ?? [];
                $query->whereIn('role', $roles)->where('status', 'active');
                break;

            case 'specific':
                $userIds = $this->announcement->target_users ?? [];
                $query->whereIn('id', $userIds);
                break;

            case 'filtered':
                $filters = $this->announcement->target_filters ?? [];
                $query = $this->applyFilters($query, $filters);
                break;
        }

        return $query->get();
    }

    private function applyFilters($query, $filters)
    {
        foreach ($filters as $key => $value) {
            switch ($key) {
                case 'status':
                    $query->where('status', $value);
                    break;
                case 'role':
                    $query->whereIn('role', (array)$value);
                    break;
                case 'join_date_after':
                    $query->where('created_at', '>=', $value);
                    break;
                case 'join_date_before':
                    $query->where('created_at', '<=', $value);
                    break;
                case 'last_active_after':
                    $query->where('last_login_at', '>=', $value);
                    break;
            }
        }

        return $query;
    }

    private function formatAnnouncementMessage(): string
    {
        $priorityLabel = strtoupper($this->announcement->priority);
        
        return "[{$priorityLabel} ANNOUNCEMENT]\n" .
               "Subject: {$this->announcement->title}\n\n" .
               $this->announcement->message . "\n\n" .
               "---\n" .
               "This is an official announcement from administration.";
    }
}