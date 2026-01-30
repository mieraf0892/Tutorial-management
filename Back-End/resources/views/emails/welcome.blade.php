<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome Email</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Academic Tutorial System</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{ $user->name }}!</h2>
            
            <p>Thank you for registering as a <strong>{{ ucfirst($role) }}</strong> on our platform.</p>
            
            @if($role === 'student')
            <p>As a student, you can now:</p>
            <ul>
                <li>Browse available tutorials</li>
                <li>Book sessions with tutors</li>
                <li>Track your learning progress</li>
                <li>Make secure payments</li>
            </ul>
            @elseif($role === 'tutor')
            <p>As a tutor, you can now:</p>
            <ul>
                <li>Create tutorial sessions</li>
                <li>Manage your schedule</li>
                <li>Connect with students</li>
                <li>Receive payments</li>
            </ul>
            @elseif($role === 'admin')
            <p>As an administrator, you can now:</p>
            <ul>
                <li>Manage users and roles</li>
                <li>Monitor system activities</li>
                <li>Generate reports</li>
                <li>Configure system settings</li>
            </ul>
            @endif

            <p style="margin-top: 30px;">
                <a href="{{ config('app.url') }}/login" class="button">Login to Your Account</a>
            </p>
            
            <p style="margin-top: 20px;">
                If you have any questions, please contact our support team.
            </p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} Academic Tutorial System. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>