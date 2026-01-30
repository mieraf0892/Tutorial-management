<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class TutorRejectionEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $reason;

    public function __construct(User $user, $reason = null)
    {
        $this->user = $user;
        $this->reason = $reason;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Tutor Application Status - Tutorial Management System',
            from: config('mail.from.address', 'noreply@tutorialsystem.com'),
            replyTo: config('mail.from.address', 'noreply@tutorialsystem.com'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.tutor-rejection',
            with: [
                'user' => $this->user,
                'reason' => $this->reason,
                'supportEmail' => 'support@tutorialsystem.com',
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}