<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class VerifyRecaptcha
{
    public function handle(Request $request, Closure $next)
    {
        if (!config('services.recaptcha.secret')) {
            abort(500, 'reCAPTCHA secret not configured.');
        }

        $request->validate([
            'captcha_token' => 'required|string',
        ]);

        $response = Http::asForm()->post(
            'https://www.google.com/recaptcha/api/siteverify',
            [
                'secret'  => config('services.recaptcha.secret'),
                'response'=> $request->captcha_token,
                'remoteip'=> $request->ip(),
            ]
        );

        if (!($response->json('success') === true)) {
            abort(422, 'reCAPTCHA verification failed.');
        }

        return $next($request);
    }
}
