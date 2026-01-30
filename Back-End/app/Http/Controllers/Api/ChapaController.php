<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ChapaController extends Controller
{
    // In ChapaController.php - update the initialize method
public function initialize(Request $request)
{
    try {
        $user = auth()->user();
        
        // 1. Fetch the student record
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student record not found.'
            ], 404);
        }

        // 2. Validate that a course is selected
        if (!$student->selected_course_id) {
            return response()->json([
                'success' => false,
                'message' => 'Please select a course before making payment.'
            ], 400);
        }

        // 3. Validate that price is calculated
        $amount = (float) $student->final_price;
        
        if ($amount <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Price not calculated. Please select a course first.'
            ], 400);
        }

        // 4. Check if already paid
        $completedPayment = Payment::where('user_id', $user->id)
            ->where('status', 'completed')
            ->first();

        if ($completedPayment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment already completed'
            ], 400);
        }

        // 5. Generate unique tx_ref
        $tx_ref = 'TUTORIAL-' . now()->timestamp . '-' . $user->id . '-' . Str::random(6);

        // 6. Prepare payload
        $payload = [
            'amount' => $amount,
            'currency' => 'ETB',
            'email' => $user->email,
            'first_name' => $user->name,
            'tx_ref' => $tx_ref,
            'callback_url' => route('payment.verify', ['tx_ref' => $tx_ref]),
            // ChapaController.php
            'return_url' => config('app.frontend_url') . "/dashboard?payment=success&tx_ref=" . $tx_ref,
            'customization' => [
                'title' => 'Tutorial Payment',
                'description' => 'Payment for ' . ($student->selectedCourse->title ?? 'Selected Course')
            ]
        ];

        // 7. Log the request for debugging
        Log::info('Chapa Payment Initialization', [
            'user_id' => $user->id,
            'student_id' => $student->id,
            'amount' => $amount,
            'course_id' => $student->selected_course_id,
            'tx_ref' => $tx_ref
        ]);

        // 8. Initialize Chapa payment
        $response = Http::withoutVerifying() // 👈 Add this line
    ->withToken(env('CHAPA_SECRET_KEY'))
    ->timeout(30)
    ->post('https://api.chapa.co/v1/transaction/initialize', $payload);

        // 9. Check response
        if (!$response->successful()) {
            Log::error('Chapa API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
                'payload' => $payload
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to initialize payment gateway',
                'error' => $response->json()['message'] ?? 'Unknown error'
            ], 500);
        }

        $result = $response->json();

// 10. Create payment record (FIXED to match your actual database)

$payment = Payment::create([
    'user_id' => $user->id,
    // Use 'description' instead of 'course_id' for now to avoid SQL errors
    'description' => 'Course ID: ' . ($request->course_id ?? $student->selected_course_id),
    'transaction_reference' => $tx_ref,
    'amount' => $amount,
    'currency' => 'ETB',
    'status' => 'pending',
    'payment_method' => 'Chapa',
    'checkout_url' => $result['data']['checkout_url'],
]);

        Log::info('Payment Record Created', [
            'payment_id' => $payment->id,
            'tx_ref' => $tx_ref
        ]);

        return response()->json([
            'success' => true,
            'checkout_url' => $result['data']['checkout_url'],
            'tx_ref' => $tx_ref,
            'amount' => $amount
        ]);

    } catch (\Exception $e) {
        Log::error('Payment Initialization Exception', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Payment initialization failed',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
        ], 500);
    }
}

    /**
     * Verify payment
     */
  public function verify($tx_ref)
{
    $payment = Payment::where('transaction_reference', $tx_ref)->first();
    if (!$payment) return response()->json(['success' => false], 404);

    if ($payment->status === 'completed') return response()->json(['success' => true]);

    $response = Http::withoutVerifying()
        ->withToken(env('CHAPA_SECRET_KEY'))
        ->get("https://api.chapa.co/v1/transaction/verify/{$tx_ref}");

    $result = $response->json();

    // Inside ChapaController@verify
if ($response->successful() && ($result['data']['status'] ?? '') === 'success') {
    $payment->update(['status' => 'completed']);

    // Get the course ID from the student record since it's not in the payments table
    $student = \App\Models\Student::where('user_id', $payment->user_id)->first();

    if ($student && $student->selected_course_id) {
        \App\Models\Enrollment::updateOrCreate([
            'user_id' => $payment->user_id,
            'course_id' => $student->selected_course_id,
        ], [
            'payment_id' => $payment->id,
            'status' => 'active',
        ]);
    }

    \App\Models\Student::where('user_id', $payment->user_id)->update(['is_paid' => true]);
    return response()->json(['success' => true]);
}

    $payment->update(['status' => 'failed']);
    return response()->json(['success' => false]);
}

    /**
     * Get payment status for logged-in user
     */
    public function status()
    {
        $payment = Payment::where('user_id', auth()->id())
            ->latest()
            ->first();

        // If it shows pending but user says they paid, force a verification check
        if ($payment && $payment->status === 'pending') {
            $this->verify($payment->transaction_reference);
            $payment->refresh();
        }

        return response()->json([
            'status' => $payment?->status ?? 'none'
        ]);
    }
}