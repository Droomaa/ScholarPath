<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/my-programs', function () {
    return Inertia::render('MyPrograms');
})->middleware(['auth', 'verified'])->name('my-programs');

Route::get('/ai-guide', function () {
    return Inertia::render('AIGuide');
})->middleware(['auth', 'verified'])->name('ai-guide');

Route::get('/search', function (\Illuminate\Http\Request $request) {
    return Inertia::render('Search', [
        'query' => $request->query('q', ''),
    ]);
})->middleware(['auth', 'verified'])->name('search');

// Institution Routes
Route::get('/kelola-program', function () {
    return Inertia::render('Institution/KelolaProgram');
})->middleware(['auth', 'verified'])->name('kelola-program');

Route::get('/pelamar', function () {
    return Inertia::render('Institution/Pelamar');
})->middleware(['auth', 'verified'])->name('pelamar');



Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/admin/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');

    Route::get('/admin/user-management', function () {
        return Inertia::render('Admin/UserManagement');
    })->name('admin.user-management');

    Route::get('/admin/content-verification', function () {
        return Inertia::render('Admin/ContentVerification');
    })->name('admin.content-verification');

    Route::get('/admin/institution-verification', function () {
        return Inertia::render('Admin/InstitutionVerification');
    })->name('admin.institution-verification');

    Route::get('/admin/system-logs', function () {
        return Inertia::render('Admin/SystemLogs');
    })->name('admin.system-logs');

    Route::get('/admin/settings', function () {
        return Inertia::render('Admin/Settings');
    })->name('admin.settings');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
