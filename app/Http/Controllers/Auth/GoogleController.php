<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class GoogleController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     *
     * @return RedirectResponse
     */
    public function redirectToGoogle(): RedirectResponse
    {
        $clientId = config('services.google.client_id');
        if (empty($clientId)) {
            return redirect()->to(url('/auth/google/callback?mock=true'));
        }
        return Socialite::driver('google')->redirect();
    }

    /**
     * Obtain the user information from Google.
     *
     * @return RedirectResponse
     */
    public function handleGoogleCallback(): RedirectResponse
    {
        try {
            $clientId = config('services.google.client_id');
            if (empty($clientId) && request()->get('mock') === 'true') {
                $mockId = 'mock_google_id_123456789';
                $mockEmail = 'piksistudent@gmail.com';
                $mockName = 'Mahasiswa Piksi Input';
                
                // Find existing admin or first user to make testing easier, otherwise create one
                $user = User::where('google_id', $mockId)->first();
                if (!$user) {
                    $user = User::where('role', 'admin')->first() ?: User::first();
                    if ($user) {
                        $user->update([
                            'google_id' => $mockId,
                        ]);
                    } else {
                        $user = User::create([
                            'name' => $mockName,
                            'email' => $mockEmail,
                            'google_id' => $mockId,
                            'role' => 'admin',
                            'password' => null,
                        ]);
                    }
                }
                
                Auth::login($user);
                request()->session()->regenerate();
                return redirect()->intended(route('dashboard', absolute: false));
            }

            $googleUser = Socialite::driver('google')->user();
        } catch (Exception $e) {
            return redirect()->route('login')->withErrors([
                'email' => 'Gagal masuk menggunakan Google. Silakan coba lagi.',
            ]);
        }

        // Cari user berdasarkan google_id terlebih dahulu
        $user = User::where('google_id', $googleUser->getId())->first();

        if (!$user) {
            // Jika google_id belum terdaftar, cari berdasarkan email
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // Jika email sudah terdaftar, tautkan google_id
                $user->update([
                    'google_id' => $googleUser->getId(),
                ]);
            } else {
                // Jika email belum terdaftar, buat akun baru
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'role' => 'user',
                    'password' => null,
                ]);
            }
        }

        Auth::login($user);

        request()->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
