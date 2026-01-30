<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome Student</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; border: 1px solid #ddd; border-top: none; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        .info-box { background: #e8f4ff; padding: 15px; border-left: 4px solid #4F46E5; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Academic Tutorial System!</h1>
            <p>Your Student Account is Now Active</p>
        </div>
        
        <div class="content">
            <h2>Hello {{ $user->name }}!</h2>
            
            <p>Congratulations! Your email has been verified and your student account is now fully activated.</p>
            
            <div class="info-box">
                <h3>📚 Your Learning Journey Starts Now!</h3>
                <p>As a verified student, you can:</p>
                <ul>
                    <li>Browse and enroll in tutorials</li>
                    <li>Book one-on-one sessions with tutors</li>
                    <li>Track your learning progress</li>
                    <li>Access course materials</li>
                    <li>Make secure payments</li>
                </ul>
            </div>

            <p><strong>Account Details:</strong></p>
            <ul>
                <li><strong>Name:</strong> {{ $user->name }}</li>
                <li><strong>Email:</strong> {{ $user->email }}</li>
                <li><strong>Course Type:</strong> {{ $student->course_type ?? 'Not specified' }}</li>
                <li><strong>Status:</strong> Active ✅</li>
            </ul>

            <p style="text-align: center;">
                <a href="http://localhost:5173/dashboard?verified=success" class="button">
                    Go to Student Dashboard
                </a>
            </p>
            
            <p>If you need any assistance, our support team is here to help.</p>
            
            <p>Happy Learning!<br>
            The Academic Tutorial System Team</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} Academic Tutorial System. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>Contact support: support@tutorialsystem.com</p>
        </div>
    </div>
</body>
</html>