<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EnrollmentService;
use App\Services\PaymentService;
use App\Services\ChapaService;
use App\Models\Tutorial;
use App\Models\Payment;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    protected $enrollmentService;
    protected $paymentService;
    protected $chapaService;

    public function __construct(
        EnrollmentService $enrollmentService,
        PaymentService $paymentService,
        ChapaService $chapaService
    ) {
        $this->enrollmentService = $enrollmentService;
        $this->paymentService = $paymentService;
        $this->chapaService = $chapaService;
    }

    /**
     * Initialize payment for tutorial enrollment
     */
    public function initialize(Request $request, Tutorial $tutorial)
    {
        $validator = Validator::make($request->all(), [
            'payment_method' => 'sometimes|in:chapa',
            'return_url' => 'sometimes|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        
        // Check if user is a student
        if ($user->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Only students can enroll in tutorials'
            ], 403);
        }

        // Check if tutorial is free
        if ($tutorial->is_free) {
            // Direct enrollment for free tutorials
            $enrollment = $this->enrollmentService->createPending($user->id, $tutorial->id);
            $this->enrollmentService->activate($enrollment->id);
            
            return response()->json([
                'success' => true,
                'message' => 'Successfully enrolled in free tutorial',
                'data' => [
                    'enrollment_id' => $enrollment->id,
                    'tutorial_id' => $tutorial->id,
                    'is_free' => true,
                ]
            ]);
        }

        // Check if already enrolled
        $existingEnrollment = Enrollment::where('user_id', $user->id)
            ->where('tutorial_id', $tutorial->id)
            ->whereIn('status', ['active', 'pending'])
            ->first();

        if ($existingEnrollment) {
            // Check if there's an active payment
            $existingPayment = Payment::where('enrollment_id', $existingEnrollment->id)
                ->whereIn('status', ['pending', 'completed'])
                ->first();

            if ($existingPayment && $existingPayment->isCompleted()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are already enrolled in this tutorial'
                ], 400);
            }

            if ($existingPayment && $existingPayment->isPending()) {
                // Check if we need to regenerate payment link
                return response()->json([
                    'success' => false,
                    'message' => 'You have a pending payment for this tutorial',
                    'data' => [
                        'enrollment_id' => $existingEnrollment->id,
                        'payment_reference' => $existingPayment->chapa_reference,
                    ]
                ], 400);
            }
        }

        // Create pending enrollment
        $enrollment = $this->enrollmentService->createPending($user->id, $tutorial->id);

        // Create pending payment
        try {
            $payment = $this->paymentService->createPending(
                $user->id,
                $tutorial->id,
                $enrollment->id,
                $tutorial->price
            );
        } catch (\Exception $e) {
            Log::error('Failed to create payment record', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'tutorial_id' => $tutorial->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment record'
            ], 500);
        }

        // Prepare Chapa payload
        $chapaData = [
            'amount' => $tutorial->price,
            'currency' => 'ETB',
            'email' => $user->email,
            'first_name' => $this->getFirstName($user->name),
            'last_name' => $this->getLastName($user->name),
            'tx_ref' => $payment->chapa_reference,
            'callback_url' => route('payment.webhook'),
            'return_url' => $request->return_url ?? config('app.frontend_url') . '/payment/callback',
            'title' => "Enrollment: {$tutorial->title}",
            'description' => "Payment for {$tutorial->title} tutorial",
            'user_id' => $user->id,
            'tutorial_id' => $tutorial->id,
            'enrollment_id' => $enrollment->id,
        ];

        try {
            // Initialize Chapa payment
            $chapaResponse = $this->chapaService->initializePayment($chapaData);

            return response()->json([
                'success' => true,
                'message' => 'Payment initialized successfully',
                'data' => [
                    'checkout_url' => $chapaResponse['data']['checkout_url'],
                    'payment_reference' => $payment->chapa_reference,
                    'enrollment_id' => $enrollment->id,
                    'tutorial_id' => $tutorial->id,
                    'amount' => $tutorial->price,
                    'currency' => 'ETB',
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Chapa payment initialization failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'tutorial_id' => $tutorial->id,
                'chapa_data' => $chapaData,
            ]);

            // Mark payment as failed
            $this->paymentService->markFailed($payment->chapa_reference);
            
            // Cancel enrollment if payment fails
            $this->enrollmentService->cancel($enrollment->id);

            return response()->json([
                'success' => false,
                'message' => 'Failed to initialize payment. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Payment service unavailable'
            ], 500);
        }
    }

    /**
     * Handle Chapa webhook callback
     */
    public function webhookCallback(Request $request)
    {
        Log::info('Chapa Webhook Received', [
            'headers' => $request->headers->all(),
            'payload' => $request->all(),
        ]);

        // Get raw payload for signature verification
        $payload = $request->getContent();
        $signature = $request->header('Chapa-Signature');

        if (!$signature) {
            Log::warning('Missing Chapa-Signature header');
            return response()->json(['message' => 'Missing signature'], 400);
        }

        // Verify webhook signature
        if (!$this->paymentService->verifyChapaSignature(json_decode($payload, true), $signature)) {
            Log::warning('Invalid webhook signature', [
                'signature' => $signature,
                'payload' => $payload,
            ]);
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $event = $request->input('event');
        $data = $request->input('data');

        Log::info('Chapa Webhook Event', [
            'event' => $event,
            'tx_ref' => $data['tx_ref'] ?? null,
        ]);

        if ($event === 'charge.success') {
            try {
                // Payment successful
                $payment = $this->paymentService->markCompleted(
                    $data['tx_ref'],
                    $data['id'] ?? null
                );

                Log::info('Payment completed successfully', [
                    'reference' => $data['tx_ref'],
                    'transaction_id' => $data['id'] ?? null,
                    'payment_id' => $payment->id,
                    'enrollment_id' => $payment->enrollment_id,
                ]);

                // You can trigger events here, like sending emails
                // event(new PaymentCompleted($payment));

            } catch (\Exception $e) {
                Log::error('Failed to process successful payment', [
                    'error' => $e->getMessage(),
                    'tx_ref' => $data['tx_ref'],
                ]);
            }

        } elseif ($event === 'charge.failure') {
            try {
                // Payment failed
                $payment = $this->paymentService->markFailed($data['tx_ref']);

                Log::warning('Payment failed', [
                    'reference' => $data['tx_ref'],
                    'reason' => $data['failure_message'] ?? 'Unknown',
                    'payment_id' => $payment->id,
                ]);

            } catch (\Exception $e) {
                Log::error('Failed to process failed payment', [
                    'error' => $e->getMessage(),
                    'tx_ref' => $data['tx_ref'],
                ]);
            }
        }

        return response()->json(['message' => 'Webhook processed']);
    }

    /**
     * Verify payment status
     */
    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'payment_reference' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $paymentReference = $request->payment_reference;

        $payment = Payment::where('chapa_reference', $paymentReference)
            ->where('user_id', $user->id)
            ->with(['tutorial', 'enrollment'])
            ->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }

        // If payment is pending, verify with Chapa
        if ($payment->isPending()) {
            try {
                $chapaVerification = $this->chapaService->verifyTransaction($paymentReference);
                
                if ($chapaVerification['status'] === 'success') {
                    $payment = $this->paymentService->markCompleted(
                        $paymentReference,
                        $chapaVerification['data']['id'] ?? null
                    );
                }
            } catch (\Exception $e) {
                Log::warning('Chapa verification failed', [
                    'error' => $e->getMessage(),
                    'payment_reference' => $paymentReference,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'payment' => $payment,
                'tutorial' => $payment->tutorial,
                'enrollment' => $payment->enrollment,
            ]
        ]);
    }

    /**
     * Get payment details
     */
    public function show(Payment $payment)
    {
        $user = Auth::user();

        // Check if user owns this payment
        if ($payment->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $payment->load(['tutorial', 'enrollment']);

        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    /**
     * Get user's payment history
     */
    public function history(Request $request)
    {
        $user = Auth::user();
        
        $perPage = $request->get('per_page', 10);
        
        $payments = Payment::where('user_id', $user->id)
            ->with(['tutorial', 'enrollment'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'payments' => $payments->items(),
                'pagination' => [
                    'current_page' => $payments->currentPage(),
                    'per_page' => $payments->perPage(),
                    'total' => $payments->total(),
                    'last_page' => $payments->lastPage(),
                ]
            ]
        ]);
    }

    /**
     * Helper method to get first name
     */
    private function getFirstName(string $fullName): string
    {
        $names = explode(' ', $fullName);
        return $names[0] ?? $fullName;
    }

    /**
     * Helper method to get last name
     */
    private function getLastName(string $fullName): string
    {
        $names = explode(' ', $fullName);
        return count($names) > 1 ? end($names) : '';
    }
}