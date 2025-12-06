<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TutorApprovalNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $isApproved;
    public $reason;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, $isApproved = true, $reason = null)
    {
        $this->user = $user;
        $this->isApproved = $isApproved;
        $this->reason = $reason;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $subject = $this->isApproved 
            ? '🎉 Your Tutor Application Has Been Approved!' 
            : '❌ Your Tutor Application Status';
            
        return $this->subject($subject)
                    ->markdown('emails.tutor_approval')
                    ->with([
                        'user' => $this->user,
                        'isApproved' => $this->isApproved,
                        'reason' => $this->reason,
                    ]);
    }
}