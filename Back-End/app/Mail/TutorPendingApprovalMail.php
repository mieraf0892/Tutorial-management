<?php
// app/Mail/TutorPendingApprovalMail.php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TutorPendingApprovalMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function build()
    {
        return $this->subject('Tutor Account Pending Approval')
                    ->view('emails.tutor-pending-approval')
                    ->with([
                        'user' => $this->user,
                        'completeProfileUrl' => url(config('app.frontend_url') . '/tutor/profile/complete'),
                    ]);
    }
}