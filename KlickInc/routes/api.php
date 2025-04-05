<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;

// Public routes for user authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    // Logout and fetch user info
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Project Endpoints:
    // GET /api/projects - List projects (for project managers, this returns all projects;
    // for team members, the controller logic can filter to return only their assigned projects)
    Route::get('/projects', [ProjectController::class, 'index']);

    // POST /api/projects - Create a new project
    Route::post('/projects', [ProjectController::class, 'store']);

    // GET /api/projects/{id} - Retrieve a single project by its ID
    Route::get('/projects/{id}', [ProjectController::class, 'show']);

    // PUT /api/projects/{id} - Update an existing project
    Route::put('/projects/{id}', [ProjectController::class, 'update']);

    // DELETE /api/projects/{id} - Delete a project
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);
});