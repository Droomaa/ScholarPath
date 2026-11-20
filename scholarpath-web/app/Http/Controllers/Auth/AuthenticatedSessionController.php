<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = Auth::user();
        if ($user->role === 'admin') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route('login')->withErrors([
                'email' => 'Akun Administrator tidak diperbolehkan masuk melalui halaman ini.',
            ]);
        }

        $loginRole = $request->input('role', 'siswa');
        $dbRole = strtolower($user->role);

        if ($loginRole === 'siswa' && $dbRole !== 'student' && $dbRole !== 'siswa') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route('login')->withErrors([
                'email' => 'Akun ini bukan akun Siswa. Silakan masuk melalui tab yang sesuai.',
            ]);
        }

        if ($loginRole === 'instansi' && $dbRole !== 'instansi') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route('login')->withErrors([
                'email' => 'Akun ini bukan akun Instansi. Silakan masuk melalui tab yang sesuai.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Display the admin login view.
     */
    public function createAdmin(): Response
    {
        return Inertia::render('Auth/AdminLogin', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming admin authentication request.
     */
    public function storeAdmin(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = Auth::user();
        if ($user->role !== 'admin') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route('admin.login')->withErrors([
                'email' => 'Kredensial ini bukan akun admin.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $isAdmin = Auth::user() && Auth::user()->role === 'admin';

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        if ($isAdmin) {
            return redirect()->route('admin.login');
        }

        return redirect('/');
    }

    /**
     * Handle authentication for Google Sign-In sync.
     */
    public function storeGoogleSync(Request $request)
    {
        $accessToken = $request->input('access_token');
        if (!$accessToken) {
            return response()->json(['error' => 'Google Access Token is required.'], 400);
        }

        // Call Google's UserInfo API to verify the access_token
        $response = Http::get("https://www.googleapis.com/oauth2/v3/userinfo?access_token={$accessToken}");
        if (!$response->successful()) {
            return response()->json(['error' => 'Gagal verifikasi Google Token.'], 400);
        }

        $payload = $response->json();
        
        $email = $payload['email'] ?? null;
        $name = $payload['name'] ?? 'Google User';

        if (!$email) {
            return response()->json(['error' => 'Email tidak ditemukan di token Google.'], 400);
        }

        // Find or create user
        $user = User::where('email', $email)->first();
        if (!$user) {
            $user = new User();
            $user->name = $name;
            $user->email = $email;
            $user->password = Hash::make(Str::random(16));
            
            // Map role 'siswa' (from frontend selection) to 'student'
            $roleInput = $request->input('role', 'siswa');
            $user->role = $roleInput === 'siswa' ? 'student' : $roleInput;
            $user->save();
        }

        // Verify user role
        $loginRole = $request->input('role', 'siswa');
        $dbRole = strtolower($user->role);
        
        if ($loginRole === 'siswa' && $dbRole !== 'student' && $dbRole !== 'siswa') {
            return response()->json(['error' => 'Akun ini bukan akun Siswa. Silakan masuk melalui tab yang sesuai.'], 400);
        }
        
        if ($loginRole === 'instansi' && $dbRole !== 'instansi') {
            return response()->json(['error' => 'Akun ini bukan akun Instansi. Silakan masuk melalui tab yang sesuai.'], 400);
        }

        // Login user
        Auth::login($user);

        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'message' => 'Sesi Laravel berhasil disinkronisasi.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }
}
