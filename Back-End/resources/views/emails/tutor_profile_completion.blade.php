// resources/views/emails/tutor_profile_completion.blade.php
<!DOCTYPE html>
<html>
<head>
    <title>Complete Your Tutor Profile</title>
</head>
<body>
    <h2>Complete Your Tutor Profile</h2>
    <p>Hello {{ $user->name }},</p>
    
    <p>Your email has been verified successfully! Now you need to complete your tutor profile to start accepting students.</p>
    
    <p><strong>Required Information:</strong></p>
    <ul>
        <li>Personal details (phone, address, etc.)</li>
        <li>Educational qualification</li>
        <li>Degree photo upload</li>
        <li>Subjects you can teach</li>
        <li>Availability schedule</li>
    </ul>
    
    <p>
        <a href="{{ url('/tutor/profile/complete') }}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Complete Your Profile
        </a>
    </p>
    
    <p>After profile completion, our admin team will review your application within 24-48 hours.</p>
    
    <p>Best regards,<br>
    Tutorial Management System</p>
</body>
</html>