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
     * @return RedirectResponse|\Illuminate\Http\Response
     */
    public function redirectToGoogle()
    {
        $clientId = config('services.google.client_id');
        if (empty($clientId)) {
            // Render a beautiful mock selection page to simulate Google Login
            $users = User::all();
            
            $optionsHtml = '';
            foreach ($users as $user) {
                $optionsHtml .= "
                <form action='/auth/google/callback' method='GET' style='margin-bottom: 10px;'>
                    <input type='hidden' name='mock' value='true'>
                    <input type='hidden' name='email' value='" . e($user->email) . "'>
                    <button type='submit' style='width: 100%; padding: 12px; border: 1px solid #e2e8f0; background: #fff; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s;'>
                        <span>" . e($user->name) . " (" . e($user->email) . ")</span>
                        <span style='background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase;'>" . e($user->role) . "</span>
                    </button>
                </form>";
            }

            // Option to type an unregistered email
            $unregisteredFormHtml = "
            <form action='/auth/google/callback' method='GET' style='margin-top: 20px; border-top: 1px dashed #e2e8f0; padding-top: 20px;'>
                <input type='hidden' name='mock' value='true'>
                <label style='display: block; font-size: 14px; font-weight: 600; color: #4a5568; margin-bottom: 8px;'>Atau Coba Email Tidak Terdaftar (Akses Ditolak):</label>
                <div style='display: flex; gap: 8px;'>
                    <input type='email' name='email' placeholder='email@domain.com' required style='flex-grow: 1; padding: 10px; border: 1px solid #cbd5e0; border-radius: 8px; font-size: 14px;'>
                    <button type='submit' style='padding: 10px 16px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;'>Kirim</button>
                </div>
            </form>";

            return response("
            <!DOCTYPE html>
            <html lang='id'>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <title>Mock Google Authentication - SIArsip</title>
                <link href='https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap' rel='stylesheet'>
                <style>
                    body {
                        font-family: 'Plus Jakarta Sans', sans-serif;
                        background: #f7fafc;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                    }
                    .card {
                        background: white;
                        padding: 32px;
                        border-radius: 16px;
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                        width: 100%;
                        max-width: 480px;
                    }
                    h1 {
                        font-size: 20px;
                        font-weight: 700;
                        color: #1a202c;
                        margin-top: 0;
                        margin-bottom: 8px;
                        text-align: center;
                    }
                    p {
                        font-size: 14px;
                        color: #718096;
                        margin-bottom: 24px;
                        text-align: center;
                        line-height: 1.5;
                    }
                    button:hover {
                        border-color: #cbd5e0 !important;
                        background: #f7fafc !important;
                    }
                </style>
            </head>
            <body>
                <div class='card'>
                    <div style='text-align: center; margin-bottom: 16px;'>
                        <img src='/images/logo-piksi.png' alt='Logo Piksi' style='height: 48px;'>
                    </div>
                    <h1>Simulasi Verifikasi Google Login</h1>
                    <p>Pilih akun atau masukkan alamat email untuk menyimulasikan ekstraksi email dari API Google Auth.</p>
                    
                    <div>
                        $optionsHtml
                        $unregisteredFormHtml
                    </div>
                    
                    <div style='text-align: center; margin-top: 24px;'>
                        <a href='/login' style='font-size: 13px; color: #4f46e5; text-decoration: none; font-weight: 600;'>&larr; Kembali ke Login</a>
                    </div>
                </div>
            </body>
            </html>
            ");
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
                $mockEmail = request()->get('email', 'piksistudent@gmail.com');
                $mockId = 'mock_google_id_' . md5($mockEmail);
                
                // Cari berdasarkan email terlebih dahulu
                $user = User::where('email', $mockEmail)->first();
                if (!$user) {
                    return redirect()->route('login')->withErrors([
                        'email' => 'Akun Anda belum terdaftar. Silakan hubungi Administrator.',
                    ]);
                }
                
                if ($user->google_id !== $mockId) {
                    $user->update([
                        'google_id' => $mockId,
                    ]);
                }
                
                Auth::login($user);
                request()->session()->regenerate();
                return redirect()->route('dashboard');
            }

            $googleUser = Socialite::driver('google')->user();
        } catch (Exception $e) {
            return redirect()->route('login')->withErrors([
                'email' => 'Gagal masuk menggunakan Google. Silakan coba lagi.',
            ]);
        }

        // Cari user berdasarkan email terlebih dahulu (ekstrak email dari Google)
        $email = $googleUser->getEmail();
        $user = User::where('email', $email)->first();

        if (!$user) {
            // Jika email tidak ada di database: Akses ditolak dan sistem memunculkan pesan
            return redirect()->route('login')->withErrors([
                'email' => 'Akun Anda belum terdaftar. Silakan hubungi Administrator.',
            ]);
        }

        // Jika email terdaftar, pastikan google_id diupdate / ditautkan
        if ($user->google_id !== $googleUser->getId()) {
            $user->update([
                'google_id' => $googleUser->getId(),
            ]);
        }

        Auth::login($user);

        request()->session()->regenerate();

        return redirect()->route('dashboard');
    }
}

