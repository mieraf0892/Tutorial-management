<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tutor Account Approved</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; border: 1px solid #ddd; border-top: none; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        .info-box { background: #d1fae5; padding: 15px; border-left: 4px solid #10B981; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Congratulations! Your Tutor Account is Approved!</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{ $user->name }}!</h2>
            
            <p>Great news! Your tutor application has been reviewed and approved by our administration team.</p>
            
            <div class="info-box">
                <h3>📚 You're Now a Verified Tutor!</h3>
                <p>You can now:</p>
                <ul>
                    <li>Create and manage tutorial sessions</li>
                    <li>Set your availability and hourly rates</li>
                    <li>Connect with students</li>
                    <li>Receive payments for your services</li>
                    <li>Access tutor dashboard and analytics</li>
                </ul>
            </div>

            <p><strong>Account Details:</strong></p>
            <ul>
                <li><strong>Name:</strong> {{ $user->name }}</li>
                <li><strong>Email:</strong> {{ $user->email }}</li>
                <li><strong>Status:</strong> Active ✅</li>
                <li><strong>Approval Date:</strong> {{ now()->format('F j, Y') }}</li>
            </ul>

            @if($tutor && $tutor->hourly_rate)
            <p><strong>Hourly Rate:</strong> ${{ number_format($tutor->hourly_rate, 2) }}</p>
            @endif

            <p style="text-align: center;">
                <a href="http://localhost:5173/tutor?approved=success" class="button">
                    Go to Tutor Dashboard
                </a>
            </p>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Complete your tutor profile</li>
                <li>Set your availability schedule</li>
                <li>Create your first tutorial</li>
                <li>Start accepting student bookings</li>
            </ol>
            
            <p>If you have any questions, contact our tutor support team.</p>
            
            <p>Best regards,<br>
            The Academic Tutorial System Team</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} Academic Tutorial System. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>Tutor Support: tutor-support@tutorialsystem.com</p>
        </div>
    </div>
</body>
</html>