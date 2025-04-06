<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function index()
    {
        // If user is a project manager, return all users except themselves
        // If user is a team member, return only themselves
        if (Auth::user()->role === 'project_manager') {
            return User::where('id', '!=', Auth::id())
                      ->get(['id', 'username', 'email', 'role']);
        }
        
        return User::where('id', Auth::id())
                  ->get(['id', 'username', 'email', 'role']);
    }
}
