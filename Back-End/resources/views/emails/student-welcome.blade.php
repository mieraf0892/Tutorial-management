{{-- resources/views/emails/student-welcome.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to Our Platform</title>
</head>
<body>
    <h1>Welcome {{ $user->name }}!</h1>
    <p>Thank you for verifying your email address.</p>
    <p>Your student account is now active and ready to use.</p>
    <p>You can now:</p>
    <ul>
        <li>Browse available tutors</li>
        <li>Book tutorial sessions</li>
        <li>Track your learning progress</li>
        <li>Manage your profile</li>
    </ul>
    <p>
        <a href="{{ url('/dashboard') }}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Go to Dashboard
        </a>
    </p>
    <p>If you have any questions, feel free to contact our support team.</p>
    <p>Happy learning!<br>Tutorial Management System Team</p>
</body>
</html>