<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TaskController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if ($user->role === 'project_manager') {
            return Task::with(['project', 'user', 'comments.user'])->get();
        }
        return Task::with(['project', 'user', 'comments.user'])->where('assigned_to', $user->id)->get();
    }

    public function store(Request $request)
    {
        if (Auth::user()->role !== 'project_manager') {
            return response()->json(['message' => 'Unauthorized. Only project managers can create tasks.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'assigned_to' => 'required|exists:klick_users,id',
            'project_id' => 'required|exists:projects,id',
            'status' => 'required|string',
            'priority' => 'nullable|string',
            'deadline' => 'nullable|date',
            'budget' => 'nullable|numeric',
            'start_time' => 'nullable|date',
        ]);
        
        
        $task = Task::create($validated);
        return response()->json($task->load(['project', 'user']), 201);
    }

    public function update(Request $request, $id)
{
    $task = Task::findOrFail($id);
    $user = Auth::user();

    if ($user->role === 'project_manager') {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'assigned_to' => 'required|exists:klick_users,id',
            'project_id' => 'required|exists:projects,id',
            'status' => 'required|string',
            'priority' => 'nullable|string',
            'deadline' => 'nullable|date',
            'budget' => 'nullable|numeric',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date',
            'time_spent' => 'nullable|numeric',
        ]);
    } elseif ($user->role === 'team_member' && $task->assigned_to == $user->id) {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,in_progress,completed',
            'deadline' => 'nullable|date',
            'budget' => 'nullable|numeric',
            'amount_used' => 'nullable|numeric',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date',
            'time_spent' => 'nullable|numeric',
        ]);
    } else {
        return response()->json(['message' => 'Unauthorized. You can only update your own tasks.'], 403);
    }

    // ✨ Important: Reset if status is pending
    if ($validated['status'] === 'pending') {
        $validated['start_time'] = null;
        $validated['end_time'] = null;
        $validated['time_spent'] = null;
    } 
    // ✨ If completing task, set end_time if missing
    elseif ($validated['status'] === 'completed' && !$task->end_time) {
        $validated['end_time'] = Carbon::now();
    }

    // ✨ Calculate time_spent if both start and end are present
    if (!empty($validated['start_time']) && !empty($validated['end_time'])) {
        $startTime = Carbon::parse($validated['start_time']);
        $endTime = Carbon::parse($validated['end_time']);
        $validated['time_spent'] = $startTime->diffInSeconds($endTime);
    }

    $task->update($validated);

    return response()->json([
        'task' => $task->load(['project', 'user']),
        'total_time_spent' => $task->time_spent ? $task->time_spent . ' seconds' : null,
    ]);
}


    public function destroy($id)
    {
        if (Auth::user()->role !== 'project_manager') {
            return response()->json(['message' => 'Unauthorized. Only project managers can delete tasks.'], 403);
        }

        $task = Task::findOrFail($id);
        $task->delete();
        return response()->json(['message' => 'Task deleted']);
    }

    public function assignTask(Request $request, $id)
    {
        if (Auth::user()->role !== 'project_manager') {
            return response()->json(['message' => 'Unauthorized. Only project managers can assign tasks.'], 403);
        }

        $validated = $request->validate([
            'assigned_to' => 'required|exists:klick_users,id'
        ]);

        $task = Task::findOrFail($id);
        $task->assigned_to = $validated['assigned_to'];
        $task->save();

        return response()->json([
            'message' => 'Task assigned successfully',
            'task' => $task->load(['project', 'user'])
        ]);
    }

    public function show($id)
    {
        $task = Task::with(['project', 'user', 'comments.user'])->findOrFail($id);
        return response()->json($task);
    }

    /**
     * Get all comments for a task
     */
    public function getComments($taskId)
    {
        try {
            $task = Task::findOrFail($taskId);
            
            $comments = $task->comments()
                ->with(['user' => function($query) {
                    $query->select('id', 'username as name');
                }])
                ->latest()
                ->get()
                ->map(function($comment) {
                    return [
                        'id' => $comment->id,
                        'user_id' => $comment->user_id,
                        'task_id' => $comment->task_id,
                        'comment' => $comment->comment,
                        'created_at' => $comment->created_at,
                        'updated_at' => $comment->updated_at,
                        'user' => $comment->user ? [
                            'id' => $comment->user->id,
                            'name' => $comment->user->name
                        ] : null
                    ];
                });
                
            return response()->json($comments);
            
        } catch (\Exception $e) {
            \Log::error('Error fetching comments: ' . $e->getMessage(), [
                'task_id' => $taskId,
                'exception' => $e
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch comments',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add a comment to a task
     */
    public function addComment(Request $request, $taskId)
    {
        \Log::info('Adding comment to task ID: ' . $taskId, [
            'user_id' => auth()->id(),
            'request_data' => $request->all()
        ]);

        try {
            $validated = $request->validate([
                'comment' => 'required|string|max:1000',
            ]);

            $task = Task::findOrFail($taskId);
            
            $comment = $task->comments()->create([
                'user_id' => auth()->id(),
                'comment' => $validated['comment']
            ]);

            // Load the user relationship with only the necessary fields
            $comment->load(['user' => function($query) {
                $query->select('id', 'username as name');
            }]);

            \Log::info('Comment created successfully:', $comment->toArray());

            return response()->json($comment, 201);
            
        } catch (\Exception $e) {
            \Log::error('Error adding comment: ' . $e->getMessage(), [
                'exception' => $e,
                'task_id' => $taskId,
                'user_id' => auth()->id()
            ]);
            
            return response()->json([
                'error' => 'Failed to add comment',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a comment
     */
    public function deleteComment($taskId, $commentId)
    {
        $comment = \App\Models\Comment::where('task_id', $taskId)
            ->where('id', $commentId)
            ->firstOrFail();

        // Only the comment owner or an admin can delete the comment
        if (auth()->id() !== $comment->user_id && auth()->user()->role !== 'project_manager') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();
        return response()->json(['message' => 'Comment deleted']);
    }
}
