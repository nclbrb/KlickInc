<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Debug endpoint to check all comments in the database
     */
    public function debug()
    {
        try {
            $comments = \App\Models\Comment::with(['user' => function($q) {
                $q->select('id', 'name');
            }])->get(['id', 'content', 'user_id', 'task_id', 'created_at']);
            
            return response()->json([
                'total_comments' => $comments->count(),
                'comments' => $comments
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
    /**
     * Display a listing of the resource.
     */
    public function index($taskId)
    {
        try {
            \Log::info('Fetching comments for task', ['task_id' => $taskId]);
            
            // Get comments with user data using the Comment model directly
            $comments = \App\Models\Comment::where('task_id', $taskId)
                ->with(['user' => function($query) {
                    $query->select('id', 'name');
                }])
                ->select('id', 'content', 'user_id', 'task_id', 'created_at')
                ->latest()
                ->get();
            
            // Transform the comments to include user data in the desired format
            $formattedComments = $comments->map(function($comment) {
                return [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'user_id' => $comment->user_id,
                    'task_id' => $comment->task_id,
                    'created_at' => $comment->created_at,
                    'user' => $comment->user ? [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name
                    ] : null
                ];
            });
            
            \Log::info('Found comments:', [
                'task_id' => $taskId,
                'count' => $formattedComments->count()
            ]);
            
            return response()->json($formattedComments);
            
        } catch (\Exception $e) {
            \Log::error('Error fetching comments', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch comments',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Task $task)
    {
        try {
            // Log the request for debugging
            \Log::info('Comment request received', [
                'method' => $request->method(),
                'content_type' => $request->header('Content-Type'),
                'all_input' => $request->all(),
                'json' => $request->json() ? $request->json()->all() : null,
                'headers' => $request->headers->all()
            ]);

            // Validate the request
            $validated = $request->validate([
                'content' => 'required|string|max:1000',
            ], [
                'content.required' => 'The comment content is required',
                'content.string' => 'The comment must be a string',
                'content.max' => 'The comment may not be greater than 1000 characters',
            ]);

            // Create the comment
            $comment = $task->comments()->create([
                'content' => $validated['content'],
                'user_id' => Auth::id(),
            ]);

            // Load the user relationship with only necessary fields
            $comment->load(['user' => function($query) {
                $query->select('id', 'name');
            }]);

            // Log successful comment creation
            \Log::info('Comment created successfully', [
                'comment_id' => $comment->id,
                'task_id' => $task->id,
                'user_id' => Auth::id()
            ]);

            // Return the comment with user data
            return response()->json([
                'id' => $comment->id,
                'content' => $comment->content,
                'user_id' => $comment->user_id,
                'task_id' => $comment->task_id,
                'created_at' => $comment->created_at,
                'user' => [
                    'id' => $comment->user->id,
                    'name' => $comment->user->name
                ]
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            $errorMessage = 'Validation error: ' . json_encode($e->errors());
            \Log::error($errorMessage);
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
            
        } catch (\Exception $e) {
            $errorMessage = 'Error creating comment: ' . $e->getMessage() . '\n' . $e->getTraceAsString();
            \Log::error($errorMessage);
            return response()->json([
                'message' => 'Failed to create comment',
                'error' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $comment = Comment::findOrFail($id);
            
            if (Auth::id() !== $comment->user_id && Auth::user()->role !== 'project_manager') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: You do not have permission to delete this comment.'
                ], 403);
            }

            $comment->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Comment deleted successfully'
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Comment not found'
            ], 404);
            
        } catch (\Exception $e) {
            \Log::error('Error deleting comment: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete comment',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
