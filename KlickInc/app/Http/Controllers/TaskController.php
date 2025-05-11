<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\User;
use App\Models\Comment;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class TaskController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            
            // Log the request details
            Log::info('Fetching tasks (simplified method)', [
                'user_id' => $user->id,
                'role' => $user->role
            ]);
            
            // Use Eloquent relationships - more stable approach
            if ($user->role === 'project_manager') {
                // For project managers, get all tasks with relationships
                $tasks = Task::with(['project', 'user'])
                    ->orderBy('updated_at', 'desc')
                    ->get()
                    ->map(function($task) {
                        // Transform to consistent format
                        return [
                            'id' => $task->id,
                            'title' => $task->title,
                            'description' => $task->description,
                            'status' => $task->status,
                            'priority' => $task->priority,
                            'assigned_to' => $task->assigned_to,
                            'created_at' => $task->created_at,
                            'updated_at' => $task->updated_at,
                            'project_id' => $task->project_id,
                            'deadline' => $task->deadline,
                            'budget' => $task->budget,
                            'time_spent' => $task->time_spent,
                            'start_time' => $task->start_time,
                            'end_time' => $task->end_time,
                            'project' => $task->project ? [
                                'id' => $task->project->id,
                                'title' => $task->project->title,
                                'project_name' => $task->project->project_name,
                                'project_code' => $task->project->project_code
                            ] : null,
                            'user' => $task->user ? [
                                'id' => $task->user->id,
                                'name' => $task->user->name
                            ] : null
                        ];
                    });
                
                Log::info('Fetched tasks for project manager using Eloquent', ['count' => count($tasks)]);
                return response()->json($tasks);
            } else {
                // For team members, get only their assigned tasks
                $tasks = Task::with(['project'])
                    ->where('assigned_to', $user->id)
                    ->orderBy('updated_at', 'desc')
                    ->get()
                    ->map(function($task) {
                        // Transform to consistent format
                        return [
                            'id' => $task->id,
                            'title' => $task->title,
                            'description' => $task->description,
                            'status' => $task->status,
                            'priority' => $task->priority,
                            'assigned_to' => $task->assigned_to,
                            'created_at' => $task->created_at,
                            'updated_at' => $task->updated_at,
                            'project_id' => $task->project_id,
                            'deadline' => $task->deadline,
                            'budget' => $task->budget,
                            'time_spent' => $task->time_spent,
                            'start_time' => $task->start_time,
                            'end_time' => $task->end_time,
                            'project' => $task->project ? [
                                'id' => $task->project->id,
                                'title' => $task->project->title,
                                'project_name' => $task->project->project_name,
                                'project_code' => $task->project->project_code
                            ] : null
                        ];
                    });
                
                Log::info('Fetched tasks for team member using Eloquent', ['count' => count($tasks)]);
                return response()->json($tasks);
            }
        } catch (\Exception $e) {
            Log::error('Failed to fetch tasks (simplified method)', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id() ?? 'unauthenticated'
            ]);
            
            // Return an empty array as fallback instead of an error
            // This will prevent frontend crashes while still logging the error
            return response()->json([]);
        }
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
        
        // Send notification to the assigned user
        $assignedUser = User::find($validated['assigned_to']);
        if ($assignedUser) {
            try {
                NotificationService::notifyTaskAssigned($task, $assignedUser);
            } catch (\Exception $e) {
                Log::error('Failed to send task assignment notification: ' . $e->getMessage());
            }
        }
        
        return response()->json($task->load(['project', 'user']), 201);
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $user = Auth::user();
        $validated = [];

        if ($user->role === 'project_manager') {
            $validated = $request->validate([
                'title' => 'sometimes|required|string',
                'description' => 'nullable|string',
                'assigned_to' => 'sometimes|required|exists:klick_users,id',
                'project_id' => 'sometimes|required|exists:projects,id',
                'status' => 'sometimes|required|string|in:pending,in_progress,completed',
                'priority' => 'nullable|string',
                'deadline' => 'nullable|date',
                'budget' => 'nullable|numeric',
                'start_time' => 'nullable|date',
                'end_time' => 'nullable|date|after:start_time',
                'time_spent' => 'nullable|numeric',
            ]);
        } elseif ($user->role === 'team_member' && $task->assigned_to == $user->id) {
            $validated = $request->validate([
                'status' => 'required|string|in:pending,in_progress,completed',
                'deadline' => 'nullable|date',
                'budget' => 'nullable|numeric',
                'start_time' => 'nullable|date',
                'end_time' => 'nullable|date|after:start_time',
                'time_spent' => 'nullable|numeric',
            ]);
        } else {
            return response()->json(['message' => 'Unauthorized. You can only update your own tasks.'], 403);
        }

        // Store old values for comparison
        $oldStatus = $task->status;
        $oldAssignedTo = $task->assigned_to;

        // ✨ Important: Reset if status is pending
        if (isset($validated['status']) && $validated['status'] === 'pending') {
            $validated['start_time'] = null;
            $validated['end_time'] = null;
            $validated['time_spent'] = null;
        } 
        // ✨ If completing task, set end_time if missing
        elseif (isset($validated['status']) && $validated['status'] === 'completed' && !$task->end_time) {
            $validated['end_time'] = Carbon::now();
        }

        // ✨ Calculate time_spent if both start and end are present
        if (!empty($validated['start_time']) && !empty($validated['end_time'])) {
            $startTime = Carbon::parse($validated['start_time']);
            $endTime = Carbon::parse($validated['end_time']);
            $validated['time_spent'] = $startTime->diffInSeconds($endTime);
        }

        $task->update($validated);

        // Send notification if assignee was changed
        if (isset($validated['assigned_to']) && $oldAssignedTo != $validated['assigned_to']) {
            try {
                $assigner = auth()->user();
                $assignee = User::find($validated['assigned_to']);
                
                if ($assignee) {
                    $message = "You have been assigned to the task '{$task->title}'";
                    
                    NotificationService::createNotification(
                        $assignee->id,
                        $message,
                        'task_assigned',
                        get_class($task),
                        $task->id
                    );
                    
                    Log::info('Task assignment notification sent', [
                        'task_id' => $task->id,
                        'assigner_id' => $assigner->id,
                        'assignee_id' => $assignee->id,
                        'message' => $message
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to send task assignment notification', [
                    'error' => $e->getMessage(),
                    'task_id' => $task->id,
                    'assignee_id' => $validated['assigned_to'] ?? null
                ]);
            }
        }

        // Send notification if status was changed to completed
        if (isset($validated['status']) && $validated['status'] === 'completed' && $oldStatus !== 'completed') {
            try {
                // Notify the project manager
                if ($task->project && $task->project->user_id) {
                    $assignee = $task->assignedUser;
                    $managerMessage = "Task '{$task->title}' has been marked as completed by " . ($assignee ? $assignee->username : 'a team member');
                    
                    NotificationService::createNotification(
                        $task->project->user_id,
                        $managerMessage,
                        'task_completed',
                        get_class($task),
                        $task->id
                    );
                    
                    Log::info('Task completion notification sent to project manager', [
                        'task_id' => $task->id,
                        'project_id' => $task->project->id,
                        'manager_id' => $task->project->user_id,
                        'message' => $managerMessage
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to send task completion notification', [
                    'error' => $e->getMessage(),
                    'task_id' => $task->id,
                    'status' => $validated['status']
                ]);
            }
        }

        // Send notification if status was changed
        if (isset($validated['status']) && $oldStatus !== $validated['status']) {
            try {
                $message = "Task '{$task->title}' status changed to: " . ucfirst(str_replace('_', ' ', $task->status));
                
                // Notify the assigned user about status change
                if ($assignedUser = $task->user) {
                    NotificationService::createNotification(
                        $assignedUser->id,
                        $message,
                        'task_status_changed',
                        get_class($task),
                        $task->id
                    );
                }
                
                // If task is completed, notify the project manager
                if ($validated['status'] === 'completed') {
                    // Reload the task with the project and assigned user relationships
                    $task->load(['project', 'user']);
                    
                    if (!$task->project) {
                        Log::warning('Cannot send completion notification: Task has no project', [
                            'task_id' => $task->id
                        ]);
                        // Skip the rest of the notification logic if no project
                        // Can't use continue here as we're not in a loop
                        return response()->json([
                            'message' => 'Task status updated but no project found for notification',
                            'task' => $task->load(['project', 'user'])
                        ]);
                    }
                    
                    $managerId = $task->project->user_id;
                    $assigneeName = $task->assignedUser ? $task->assignedUser->username : 'a team member';
                    $managerMessage = "Task '{$task->title}' has been marked as completed by " . $assigneeName;
                    
                    Log::info('Sending task completed notification', [
                        'task_id' => $task->id,
                        'task_title' => $task->title,
                        'assignee_id' => $task->assignedUser ? $task->assignedUser->id : null,
                        'assignee_name' => $assigneeName,
                        'project_id' => $task->project->id,
                        'project_title' => $task->project->title,
                        'manager_id' => $managerId,
                        'current_user_id' => auth()->id(),
                        'is_assignee' => $task->assignedUser && (auth()->id() === $task->assignedUser->id)
                    ]);
                    
                    $notification = NotificationService::createNotification(
                        $managerId,
                        $managerMessage,
                        'task_completed',
                        get_class($task),
                        $task->id
                    );
                    
                    Log::info('Notification created for project manager', [
                        'notification_id' => $notification ? $notification->id : 'null',
                        'recipient_id' => $managerId,
                        'task_id' => $task->id,
                        'message' => $managerMessage
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Error in status update notifications', [
                    'error' => $e->getMessage(),
                    'task_id' => $task->id,
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }
        
        // Return the updated task with its relationships
        // Ensure we have all necessary task data including budget
        $task = $task->fresh()->load(['project', 'user']);
        
        return response()->json([
            'task' => $task,
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
        $oldAssignedTo = $task->assigned_to;
        $task->assigned_to = $validated['assigned_to'];
        $task->save();

        // Send notification to the newly assigned user
        if ($oldAssignedTo != $validated['assigned_to']) {
            try {
                $assignedUser = User::find($validated['assigned_to']);
                if ($assignedUser) {
                    NotificationService::notifyTaskAssigned($task, $assignedUser);
                }
            } catch (\Exception $e) {
                Log::error('Failed to send task assignment notification: ' . $e->getMessage());
            }
        }

        // Reload the task to ensure all fields are included
        $task = $task->fresh()->load(['project', 'user']);
        
        return response()->json([
            'message' => 'Task assigned successfully',
            'task' => $task
        ]);
    }

    public function show($id)
    {
        $task = Task::with(['project', 'user', 'comments.user'])->findOrFail($id);
        // Make sure we're returning the complete task with all fields
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
        try {
            $validated = $request->validate([
                'comment' => 'required|string',
            ]);

            $task = Task::with(['project', 'user'])->findOrFail($taskId);
            $commenter = Auth::user();
            
            $comment = $task->comments()->create([
                'comment' => $validated['comment'],
                'user_id' => $commenter->id,
            ]);
            
            // Send notification for the new comment
            if ($task->project) {
                try {
                    // If the commenter is the assignee, notify the project manager
                    if ($commenter->id === $task->assigned_to && $task->project->user_id) {
                        NotificationService::notifyNewComment($comment, $task, $commenter, $task->project->user_id);
                    } 
                    // If the commenter is the project manager, notify the assignee
                    elseif ($task->assigned_to) {
                        NotificationService::notifyNewComment($comment, $task, $commenter, $task->assigned_to);
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to send comment notification: ' . $e->getMessage());
                }
            }

            // Load the user relationship with only the necessary fields
            $comment->load(['user' => function($query) {
                $query->select('id', 'username as name');
            }]);

            return response()->json([
                'message' => 'Comment added successfully',
                'comment' => $comment
            ], 201);
            
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
