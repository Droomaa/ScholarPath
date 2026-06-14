<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\UserTheme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserThemeController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'theme' => 'required|in:light,dark'
        ]);

        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $userTheme = UserTheme::updateOrCreate(
            ['user_id' => Auth::id()],
            ['theme' => $request->theme]
        );

        return response()->json(['success' => true, 'data' => $userTheme]);
    }
}
