{{-- resources/views/emails/verify-email.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <title>Verify Your Email</title>
</head>
<body>
    <h1>Verify Your Email Address</h1>
    <p>Hello {{ $user->name }},</p>
    <p>Thank you for registering with our Tutorial Management System.</p>
    <p>Please click the link below to verify your email address:</p>
    <p>
        <a href="{{ $verificationUrl }}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email Address
        </a>
    </p>
    <p>If you did not create an account, no further action is required.</p>
    <p>Thank you,<br>Tutorial Management System Team</p>
</body>
</html>