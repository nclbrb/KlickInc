<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
// use App\Http\Controllers\CommentController; // Already present in your provided context
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Api\FileController; // <-- ADD THIS IMPORT

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
    Route::get('/projects/{projectId}/totals', [ProjectController::class, 'projectTotals']);

    // Task Endpoints:
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    Route::put('/tasks/{id}', [TaskController::class, 'update']);
    Route::post('/tasks/{id}/assign', [TaskController::class, 'assignTask']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);

    // Comment Endpoints:
    Route::get('/tasks/{taskId}/comments', [TaskController::class, 'getComments']); // This was in TaskController, consider moving to CommentController
    Route::post('/tasks/{taskId}/comments', [TaskController::class, 'addComment']); // This was in TaskController
    Route::delete('/tasks/{taskId}/comments/{commentId}', [TaskController::class, 'deleteComment']); // This was in TaskController

    // Notification Endpoints:
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);

    // --------------------------------------------------------------------
    // File Management Endpoints (NEWLY ADDED)
    // --------------------------------------------------------------------
    Route::prefix('tasks/{task}')->group(function () {
        // Upload a file for a specific task
        Route::post('/files', [FileController::class, 'uploadForTask'])->name('tasks.files.upload');

        // Get all files for a specific task
        Route::get('/files', [FileController::class, 'getForTask'])->name('tasks.files.index');
    });

    // Download a specific file
    Route::get('/files/{file}/download', [FileController::class, 'downloadFile'])->name('files.download');

    // Delete a specific file
    Route::delete('/files/{file}', [FileController::class, 'deleteFile'])->name('files.destroy');

    // Get all files for a specific project (via its tasks)
    // Route name example: projects.files.index
    Route::get('/projects/{project}/files', [FileController::class, 'getForProject'])->name('projects.files.index');
    // --------------------------------------------------------------------

});