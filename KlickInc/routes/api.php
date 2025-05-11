<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CommentController;

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

    // User Endpoints
    Route::get('/users', [UserController::class, 'index']);

    // Project Endpoints:
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

    // ADD THIS LINE for project totals
    Route::get('/projects/{projectId}/totals', [ProjectController::class, 'projectTotals']);

    // Task Endpoints:
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    Route::put('/tasks/{id}', [TaskController::class, 'update']);
    Route::post('/tasks/{id}/assign', [TaskController::class, 'assignTask']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);

    // Comment Endpoints:
    Route::get('/tasks/{taskId}/comments', [TaskController::class, 'getComments']);
    Route::post('/tasks/{taskId}/comments', [TaskController::class, 'addComment']);
    Route::delete('/tasks/{taskId}/comments/{commentId}', [TaskController::class, 'deleteComment']);
});
