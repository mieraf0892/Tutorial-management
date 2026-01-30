<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Payment Receipt</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; border: 1px solid #ddd; border-top: none; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .receipt-box { background: white; padding: 20px; border: 2px solid #3B82F6; border-radius: 8px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #10B981; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Receipt</h1>
            <p>Transaction Confirmation</p>
        </div>
        
        <div class="content">
            <h2>Hello {{ $user->name }}!</h2>
            
            <p>Thank you for your payment. Here is your receipt:</p>
            
            <div class="receipt-box">
                <h3>Payment Details</h3>
                <p><strong>Transaction ID:</strong> {{ $payment->transaction_id ?? 'N/A' }}</p>
                <p><strong>Date:</strong> {{ $payment->created_at->format('F j, Y, g:i a') }}</p>
                <p><strong>Status:</strong> <span style="color: #10B981;">Completed</span></p>
                
                <p class="amount">Amount: ${{ number_format($payment->amount, 2) }}</p>
                
                @if($tutorial)
                <p><strong>For:</strong> {{ $tutorial->title }}</p>
                <p><strong>Tutor:</strong> {{ $tutorial->tutor->user->name ?? 'N/A' }}</p>
                @endif
                
                <p><strong>Payment Method:</strong> {{ $payment->payment_method ?? 'Online Payment' }}</p>
            </div>

            <p><strong>Billing Information:</strong></p>
            <ul>
                <li><strong>Name:</strong> {{ $user->name }}</li>
                <li><strong>Email:</strong> {{ $user->email }}</li>
                <li><strong>Payment Date:</strong> {{ now()->format('F j, Y') }}</li>
            </ul>

            <p>This receipt serves as confirmation of your payment. Please keep it for your records.</p>
            
            <p>If you have any questions about this payment, please contact our support team.</p>
            
            <p>Best regards,<br>
            The Academic Tutorial System Team</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} Academic Tutorial System. All rights reserved.</p>
            <p>This is an automated receipt. Please do not reply to this email.</p>
            <p>Payment Support: payments@tutorialsystem.com</p>
        </div>
    </div>
</body>
</html>