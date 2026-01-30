<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Models\Tutor;

class TutorWelcomeEmail extends Mailable  // NOTE: Changed from TutorWelcomeMail to TutorWelcomeEmail
{
    use Queueable, SerializesModels;

    public $user;
    public $tutor;

    public function __construct(User $user, Tutor $tutor)
    {
        $this->user = $user;
        $this->tutor = $tutor;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🎉 Welcome to Academic Tutorial System - Tutor Account Approved!',
            from: config('mail.from.address', 'noreply@tutorialsystem.com'),
            replyTo: config('mail.from.address', 'noreply@tutorialsystem.com'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.tutor-welcome',
            with: [
                'user' => $this->user,
                'tutor' => $this->tutor,
                'dashboardUrl' => config('app.frontend_url', config('app.url')) . '/tutor/dashboard',
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}