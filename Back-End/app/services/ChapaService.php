<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChapaService
{
    protected string $baseUrl;
    protected string $secretKey;

    public function __construct()
    {
        $this->baseUrl = config('services.chapa.base_url', 'https://api.chapa.co/v1');
        $this->secretKey = config('services.chapa.secret_key');
        
        if (empty($this->secretKey)) {
            throw new \Exception('Chapa secret key not configured');
        }
    }

    public function initializePayment(array $data): array
    {
        $payload = [
            'amount' => $this->formatAmount($data['amount']),
            'currency' => $data['currency'] ?? 'ETB',
            'email' => $data['email'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'] ?? '',
            'tx_ref' => $data['tx_ref'],
            'callback_url' => $data['callback_url'],
            'return_url' => $data['return_url'] ?? null,
            'customization' => [
                'title' => $data['title'] ?? 'Tutorial Enrollment',
                'description' => $data['description'] ?? 'Payment for tutorial access',
                'logo' => config('app.url') . '/logo.png',
            ],
            'meta' => [
                'user_id' => $data['user_id'],
                'tutorial_id' => $data['tutorial_id'],
                'enrollment_id' => $data['enrollment_id'],
            ]
        ];

        Log::info('Initializing Chapa payment', [
            'reference' => $data['tx_ref'],
            'amount' => $payload['amount'],
            'user_id' => $data['user_id'],
        ]);

        $response = Http::withToken($this->secretKey)
            ->withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])
            ->timeout(30)
            ->post($this->baseUrl . '/transaction/initialize', $payload);

        if (!$response->successful()) {
            Log::error('Chapa API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
                'payload' => $payload,
            ]);
            
            throw new \Exception('Chapa payment initialization failed. Status: ' . $response->status());
        }

        $responseData = $response->json();
        
        Log::info('Chapa payment initialized successfully', [
            'reference' => $data['tx_ref'],
            'checkout_url' => $responseData['data']['checkout_url'] ?? null,
        ]);

        return $responseData;
    }

    public function verifyTransaction(string $reference): array
    {
        Log::info('Verifying Chapa transaction', ['reference' => $reference]);

        $response = Http::withToken($this->secretKey)
            ->withHeaders(['Accept' => 'application/json'])
            ->timeout(15)
            ->get($this->baseUrl . '/transaction/verify/' . $reference);

        if (!$response->successful()) {
            Log::error('Chapa verification failed', [
                'reference' => $reference,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            
            throw new \Exception('Chapa verification failed: ' . $response->status());
        }

        $responseData = $response->json();
        
        Log::info('Chapa transaction verified', [
            'reference' => $reference,
            'status' => $responseData['status'] ?? 'unknown',
        ]);

        return $responseData;
    }

    private function formatAmount(float $amount): string
    {
        // Chapa expects amount as string, formatted to 2 decimal places
        return number_format($amount, 2, '.', '');
    }
}