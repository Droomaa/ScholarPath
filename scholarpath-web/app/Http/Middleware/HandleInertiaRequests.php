<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $goToken = null;
        if ($user) {
            $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
            $payload = json_encode([
                'user_id' => $user->id,
                'exp' => time() + 86400, // 24 hours
            ]);
            
            $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
            $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
            
            $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, env('JWT_SECRET', 'rahasiaku123'), true);
            $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
            
            $goToken = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
        }

        $userArray = $user ? $user->toArray() : null;
        if ($user && $user->role === 'instansi') {
            $instansi = \Illuminate\Support\Facades\DB::table('instansis')->where('user_id', $user->id)->first();
            if ($instansi) {
                $userArray['instansi_id'] = $instansi->id;
                $userArray['is_verified'] = $instansi->is_verified;
                $userArray['status'] = $instansi->status ?? 'pending';
                $userArray['has_uploaded_docs'] = (!empty($instansi->sk_document) && !empty($instansi->legal_document));
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userArray,
                'go_token' => $goToken,
            ],
        ];
    }
}
