@component('mail::message')
# ❌ Tutor Application Update

Dear {{ $user->name }},

Thank you for your interest in becoming a tutor with our platform.

After careful review by our admin team, we regret to inform you that your tutor registration has **not been approved** at this time.

**Reason for Rejection:**
{{ $reason }}

**What You Can Do:**
- Address the concerns mentioned above
- Improve your qualifications or experience
- Submit a new application in 30 days
- Contact our support team for clarification

We encourage you to address these issues and apply again in the future.

@component('mail::button', ['url' => url('/contact')])
Contact Support Team
@endcomponent

Thank you for your understanding.

Best regards,<br>
{{ config('app.name') }} Admin Team
@endcomponent