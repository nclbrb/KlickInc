<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController; // Corrected the import path for ProjectController

// Public routes for authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    // Logout and fetch user info
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Routes for managing projects (requires authentication)
    Route::get('/projects', [ProjectController::class, 'index']);        // Get all projects
    Route::post('/projects', [ProjectController::class, 'store']);       // Create a new project
    Route::put('/projects/{id}', [ProjectController::class, 'update']);  // Update a project
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']); // Delete a project
});
