@component('mail::message')
@if($isApproved)
# 🎉 Congratulations, {{ $user->name }}!

Your tutor application has been **approved** by our admin team!

You can now log in to your account and start using all tutor features.

**Next Steps:**
1. Log in to your account
2. Complete your profile (if not already done)
3. Start creating tutorials
4. Connect with students

@component('mail::button', ['url' => url('/login')])
Login to Your Account
@endcomponent

If you have any questions, please contact our support team.

@else
# ❌ Tutor Application Update

Dear {{ $user->name }},

Thank you for your interest in becoming a tutor with us.

After reviewing your application, we regret to inform you that your tutor registration has **not been approved** at this time.

**Reason:**
{{ $reason }}

You can:
1. Address the issues mentioned above
2. Submit a new application in the future
3. Contact our support team for more information

Thank you for your understanding.

@component('mail::button', ['url' => url('/contact')])
Contact Support
@endcomponent
@endif

Best regards,<br>
{{ config('app.name') }} Team
@endcomponent