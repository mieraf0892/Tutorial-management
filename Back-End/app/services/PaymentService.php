<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Enrollment;
use App\Models\Tutorial;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    public function createPending(int $userId, int $tutorialId, int $enrollmentId, float $amount): Payment
    {
        $tutorial = Tutorial::findOrFail($tutorialId);
        
        $chapaReference = 'CHAPA_' . uniqid() . '_' . time();
        
        $payment = Payment::create([
            'user_id'       => $userId,
            'tutorial_id'   => $tutorialId,
            'enrollment_id' => $enrollmentId,
            'amount'        => $amount,
            'currency'      => 'ETB',
            'chapa_reference' => $chapaReference,
            'payment_method' => 'chapa',
            'status'        => 'pending',
            'description'   => "Payment for tutorial: {$tutorial->title}",
            'metadata'      => [
                'tutorial_title' => $tutorial->title,
                'created_at' => now()->toISOString(),
            ],
        ]);

        Log::info('Payment created', [
            'payment_id' => $payment->id,
            'reference' => $chapaReference,
            'user_id' => $userId,
            'amount' => $amount,
        ]);

        return $payment;
    }

    public function markCompleted(string $chapaReference, string $transactionId = null): Payment
    {
        $payment = Payment::where('chapa_reference', $chapaReference)->firstOrFail();
        
        $payment->update([
            'status' => 'completed',
            'transaction_id' => $transactionId,
            'completed_at' => now(),
            'metadata' => array_merge($payment->metadata ?? [], [
                'completed_at' => now()->toISOString(),
                'transaction_id' => $transactionId,
            ]),
        ]);

        Log::info('Payment marked as completed', [
            'payment_id' => $payment->id,
            'reference' => $chapaReference,
            'transaction_id' => $transactionId,
        ]);

        // Activate the enrollment
        if ($payment->enrollment_id) {
            try {
                $enrollmentService = app(EnrollmentService::class);
                $enrollmentService->activate($payment->enrollment_id);
                
                Log::info('Enrollment activated after payment', [
                    'enrollment_id' => $payment->enrollment_id,
                    'payment_id' => $payment->id,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to activate enrollment after payment', [
                    'error' => $e->getMessage(),
                    'enrollment_id' => $payment->enrollment_id,
                    'payment_id' => $payment->id,
                ]);
            }
        }

        return $payment;
    }

    public function markFailed(string $chapaReference): Payment
    {
        $payment = Payment::where('chapa_reference', $chapaReference)->firstOrFail();
        
        $payment->update([
            'status' => 'failed',
            'metadata' => array_merge($payment->metadata ?? [], [
                'failed_at' => now()->toISOString(),
            ]),
        ]);

        Log::warning('Payment marked as failed', [
            'payment_id' => $payment->id,
            'reference' => $chapaReference,
        ]);

        return $payment;
    }

    public function verifyChapaSignature(array $payload, string $signature): bool
    {
        $secret = config('services.chapa.webhook_secret');
        
        if (empty($secret)) {
            Log::warning('Chapa webhook secret not configured');
            return false;
        }
        
        $payloadString = json_encode($payload);
        $calculatedSignature = hash_hmac('sha256', $payloadString, $secret);
        
        $isValid = hash_equals($calculatedSignature, $signature);
        
        if (!$isValid) {
            Log::warning('Invalid Chapa signature', [
                'calculated' => $calculatedSignature,
                'received' => $signature,
                'payload' => $payloadString,
            ]);
        }
        
        return $isValid;
    }
}