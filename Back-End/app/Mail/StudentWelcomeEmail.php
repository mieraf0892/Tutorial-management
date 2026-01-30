<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudentWelcomeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $student;

    public function __construct($user, $student)
    {
        $this->user = $user;
        $this->student = $student;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Academic Tutorial System - Student Account Activated!',
            from: config('mail.from.address'),
            replyTo: config('mail.from.address'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.student-welcome',
            with: [
                'user' => $this->user,
                'student' => $this->student,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}