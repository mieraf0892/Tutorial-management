<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tutor Application Status</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; border: 1px solid #ddd; border-top: none; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .info-box { background: #FEE2E2; padding: 15px; border-left: 4px solid #EF4444; margin: 15px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Tutor Application Status Update</h1>
        </div>

        <div class="content">
            <h2>Dear {{ $user->name }},</h2>

            <p>Thank you for your interest in becoming a tutor with our platform.</p>

            <div class="info-box">
                <h3>Application Review Result</h3>
                <p>After careful review by our admin team, we regret to inform you that your tutor application has <strong>not been approved</strong> at this time.</p>
            </div>

            @if($reason)
            <p><strong>Reason for Rejection:</strong></p>
            <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin: 10px 0;">
                {{ $reason }}
            </div>
            @endif

            <p><strong>What You Can Do Next:</strong></p>
            <ol>
                <li>Address the concerns mentioned above</li>
                <li>Improve your qualifications or experience if needed</li>
                <li>Submit a new application after 30 days</li>
                <li>Contact our support team for clarification</li>
            </ol>

            <p>We encourage you to address these issues and apply again in the future.</p>

            <p style="text-align: center;">
                <a href="mailto:{{ $supportEmail ?? 'support@tutorialsystem.com' }}" class="button">
                    Contact Support Team
                </a>
            </p>

            <p>Thank you for your understanding.</p>

            <p>Best regards,<br>
            The Academic Tutorial System Admin Team</p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} Academic Tutorial System. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>Support: {{ $supportEmail ?? 'support@tutorialsystem.com' }}</p>
        </div>
    </div>
</body>
</html>
EOF