<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'username'              => 'required|string|max:255|unique:klick_users',
            'email'                 => 'required|string|email|max:255|unique:klick_users',
            'password'              => 'required|string|min:6|confirmed',
            'role'                  => 'required|string|in:project_manager,team_member',
        ]);

        // Create the user with the provided role
        $user = User::create([
            'username' => $request->username,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        // Create token for the new user
        $token = $user->createToken('auth_token')->plainTextToken;

        // Return success response with token and user details
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ], 201);
    }

    /**
     * Login an existing user.
     */
    public function login(Request $request)
    {
        // Validate the login request
        $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Check if the user exists and the provided password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Create token for the user
        $token = $user->createToken('auth_token')->plainTextToken;

        // Return response with token and user details
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ]);
    }

    /**
     * Logout the authenticated user.
     */
    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        // Return success message
        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
