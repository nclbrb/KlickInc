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
    // index, store methods remain the same...

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
                            'time_spent' => $task->time_spent, // Include time_spent
                            'start_time' => $task->start_time, // Include start_time
                            'end_time' => $task->end_time,     // Include end_time
                            'amount_used' => $task->amount_used,
                            'project' => $task->project ? [
                                'id' => $task->project->id,
                                'title' => $task->project->title,
                                'project_name' => $task->project->project_name,
                                'project_code' => $task->project->project_code
                            ] : null,
                            'user' => $task->user ? [
                                'id' => $task->user->id,
                                'name' => $task->user->name,
                                'username' => $task->user->username // Ensure username is available if needed
                            ] : null
                        ];
                    });

                Log::info('Fetched tasks for project manager using Eloquent', ['count' => count($tasks)]);
                return response()->json($tasks);
            } else {
                // For team members, get only their assigned tasks
                $tasks = Task::with(['project']) // No need to load 'user' here as it's always the current user
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
                            'time_spent' => $task->time_spent, // Include time_spent
                            'start_time' => $task->start_time, // Include start_time
                            'end_time' => $task->end_time,     // Include end_time
                            'amount_used' => $task->amount_used,
                            'project' => $task->project ? [
                                'id' => $task->project->id,
                                'title' => $task->project->title,
                                'project_name' => $task->project->project_name,
                                'project_code' => $task->project->project_code
                            ] : null
                            // 'user' relationship not needed here as it's the logged-in user's tasks
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
            return response()->json([]); // Return empty array on error
        }
    }

    public function store(Request $request)
    {
        if (Auth::user()->role !== 'project_manager') {
            return response()->json(['message' => 'Unauthorized. Only project managers can create tasks.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255', // Added max length
            'description' => 'nullable|string',
            'assigned_to' => 'required|exists:klick_users,id',
            'project_id' => 'required|exists:projects,id',
            'status' => 'required|string|in:pending,in_progress,completed', // Ensure valid status on create
            'priority' => 'nullable|string|in:low,medium,high', // Enforce priority values
            'deadline' => 'nullable|date',
            'budget' => 'nullable|numeric|min:0',
            'amount_used' => 'nullable|numeric|min:0',
            'start_time' => 'nullable|date',
            // 'end_time' and 'time_spent' should generally not be set on creation
        ]);

        // Ensure status is 'pending' if not provided or invalid? Or rely on validation.
        // Default status might be better handled in the model or migration.
        if (empty($validated['status'])) {
            $validated['status'] = 'pending';
        }


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

        // Load relationships for the response
        return response()->json($task->load(['project', 'user']), 201);
    }


    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $user = Auth::user();
        $validated = []; // Initialize validated array

        Log::info('Task update request received', [
            'task_id' => $id,
            'user_id' => $user->id,
            'user_role' => $user->role,
            'request_data' => $request->all()
        ]);

        // Define base validation rules common to both roles if applicable
        $baseRules = [
            'status' => 'sometimes|required|string|in:pending,in_progress,completed',
            'deadline' => 'nullable|date',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after_or_equal:start_time', // Allow same start/end time
            'time_spent' => 'nullable|numeric|min:0',
            'amount_used' => 'nullable|numeric|min:0',
        ];

        // Define PM specific rules
        $pmRules = [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'sometimes|required|exists:klick_users,id',
            'project_id' => 'sometimes|required|exists:projects,id',
            'priority' => 'nullable|string|in:low,medium,high',
            'budget' => 'nullable|numeric|min:0',
        ];

        // Define Team Member specific rules (only what they can change)
        $tmRules = [
            'status' => 'required|string|in:pending,in_progress,completed', // Status is required when TM updates
            // Team members can update these based on baseRules
        ];


        // Apply validation based on role
        if ($user->role === 'project_manager') {
            $validated = $request->validate(array_merge($baseRules, $pmRules));
        } elseif ($user->role === 'team_member' && $task->assigned_to == $user->id) {
            // Team member can only update specific fields
            $allowedTmFields = ['status', 'deadline', 'start_time', 'end_time', 'time_spent', 'amount_used'];
            $requestData = $request->only($allowedTmFields); // Filter request data

            // Validate only the allowed fields provided in the request
            $rulesToValidate = array_intersect_key(array_merge($baseRules, $tmRules), $requestData);
            // Ensure status rule is applied if status is in the request
             if (isset($requestData['status'])) {
                 $rulesToValidate['status'] = $tmRules['status'];
             } else {
                 // If status is not being updated by TM, remove it from validation rules
                 unset($rulesToValidate['status']);
             }

            // If TM is updating, ensure they provide at least one valid field
            if (empty($requestData)) {
                 return response()->json(['message' => 'No update data provided.'], 400);
            }

            $validated = \Illuminate\Support\Facades\Validator::make($requestData, $rulesToValidate)->validate();

        } else {
            Log::warning('Unauthorized task update attempt', [
                'task_id' => $id, 'user_id' => $user->id, 'task_assigned_to' => $task->assigned_to
            ]);
            return response()->json(['message' => 'Unauthorized. You can only update your own tasks or you lack permission.'], 403);
        }

        Log::info('Task update validation passed', [
            'task_id' => $id, 'user_id' => $user->id, 'validated_data' => $validated
        ]);

        // Store old values for comparison before applying validated data
        $oldStatus = $task->status;
        $oldAssignedTo = $task->assigned_to;

        // --- Apply Time/Status Logic ---

        // 1. Reset fields if status is moving to 'pending'
        if (isset($validated['status']) && $validated['status'] === 'pending') {
            $validated['start_time'] = null;
            $validated['end_time'] = null;
            $validated['time_spent'] = null;
            // Optionally reset amount_used? Depends on requirements.
            // $validated['amount_used'] = null;
            Log::info('Resetting time fields due to status change to pending.', ['task_id' => $id]);
        }

        // 2. Set start_time if status is moving to 'in_progress' and start_time isn't already set/provided
        if (isset($validated['status']) && $validated['status'] === 'in_progress' && !$task->start_time && empty($validated['start_time'])) {
             $validated['start_time'] = Carbon::now();
             Log::info('Setting start_time automatically due to status change to in_progress.', ['task_id' => $id]);
        }

        // 3. Set end_time if status is moving to 'completed' and end_time isn't already set/provided
        if (isset($validated['status']) && $validated['status'] === 'completed' && !$task->end_time && empty($validated['end_time'])) {
             $validated['end_time'] = Carbon::now();
             Log::info('Setting end_time automatically due to status change to completed.', ['task_id' => $id]);
        }

        // --- Calculate time_spent ---
        // Determine the effective start and end times for calculation
        // Use the value from the validated request if present, otherwise use the task's current value
        $effectiveStartTime = $validated['start_time'] ?? $task->start_time;
        // Use the potentially newly set end_time from $validated if available
        $effectiveEndTime = $validated['end_time'] ?? $task->end_time;

        // Calculate time_spent ONLY IF:
        // - time_spent was NOT explicitly provided in the request
        // - We have both an effective start time AND an effective end time
        if (empty($validated['time_spent']) && !empty($effectiveStartTime) && !empty($effectiveEndTime)) {
            try {
                $startTime = Carbon::parse($effectiveStartTime);
                $endTime = Carbon::parse($effectiveEndTime);

                // Ensure end time is after start time before calculating
                if ($endTime->isAfter($startTime)) {
                    // Add the calculated time_spent to the $validated array
                    // so it gets saved during the $task->update() call
                    $validated['time_spent'] = $startTime->diffInSeconds($endTime);
                    Log::info('Calculated time_spent automatically.', [
                        'task_id' => $id,
                        'start_time' => $startTime->toIso8601String(),
                        'end_time' => $endTime->toIso8601String(),
                        'calculated_seconds' => $validated['time_spent']
                    ]);
                } else {
                    // Don't calculate if end time is not after start time.
                    // Keep existing time_spent unless explicitly changed or reset.
                    Log::warning('End time is not after start time, cannot calculate time_spent automatically.', [
                        'task_id' => $id,
                        'start_time' => $startTime->toIso8601String(),
                        'end_time' => $endTime->toIso8601String()
                    ]);
                }
            } catch (\Exception $e) {
                 Log::error('Error parsing dates for time_spent calculation.', [
                     'task_id' => $id,
                     'start_time_raw' => $effectiveStartTime,
                     'end_time_raw' => $effectiveEndTime,
                     'error' => $e->getMessage()
                 ]);
            }
        } elseif (isset($validated['time_spent']) && !is_numeric($validated['time_spent'])) {
             // Handle potential non-numeric time_spent input if necessary
             unset($validated['time_spent']); // Or set to null/0
             Log::warning('Invalid time_spent value provided, ignoring.', [
                 'task_id' => $id,
                 'time_spent_value' => $request->input('time_spent')
             ]);
        }


        // --- Perform the update ---
        try {
            // Only update if there's something validated to update
            if (!empty($validated)) {
                $updateResult = $task->update($validated);
                if ($updateResult) {
                    Log::info('Task successfully updated in database', [
                        'task_id' => $id,
                        'updated_fields' => array_keys($validated)
                    ]);
                } else {
                     Log::warning('Task update command executed but returned false (likely no changes made)', [
                        'task_id' => $id,
                        'validated_data' => $validated
                    ]);
                }
            } else {
                 Log::info('No validated data to update task.', ['task_id' => $id]);
            }
        } catch (\Exception $e) {
            Log::error('Database error during task update', [
                'task_id' => $id,
                'error' => $e->getMessage(),
                'validated_data' => $validated
            ]);
            return response()->json(['message' => 'Failed to update task due to a server error.'], 500);
        }


        // --- Notification Logic ---
        // (Refreshed task data might be needed for notifications)
        $task->refresh(); // Get the latest data after update

        // Send notification if assignee was changed
        if (isset($validated['assigned_to']) && $oldAssignedTo != $validated['assigned_to']) {
             try {
                $assigner = auth()->user(); // User performing the update
                $assignee = User::find($validated['assigned_to']);

                if ($assignee) {
                    $message = "You have been assigned to the task '{$task->title}' by {$assigner->username}.";

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

        // Send notification if status was changed
        if (isset($validated['status']) && $oldStatus !== $validated['status']) {
            try {
                $task->loadMissing(['project.user', 'user']); // Ensure relationships are loaded

                $statusChangeMessage = "Task '{$task->title}' status changed from '{$oldStatus}' to '{$validated['status']}' by {$user->username}.";

                // Notify the assigned user about status change (if they exist and didn't make the change themselves)
                if ($task->user && $task->user->id !== $user->id) {
                     NotificationService::createNotification(
                        $task->user->id,
                        $statusChangeMessage,
                        'task_status_changed',
                        get_class($task),
                        $task->id
                    );
                     Log::info('Task status change notification sent to assignee', [
                        'task_id' => $task->id, 'assignee_id' => $task->user->id
                    ]);
                }

                // If task is completed, notify the project manager (if they exist and didn't complete it themselves)
                if ($validated['status'] === 'completed' && $task->project && $task->project->user_id) {
                    $managerId = $task->project->user_id;
                    if ($managerId !== $user->id) { // Don't notify PM if they completed it
                        $completerName = $user->username; // The user making the request completed it
                        $managerMessage = "Task '{$task->title}' in project '{$task->project->project_name}' has been marked as completed by {$completerName}.";

                        NotificationService::createNotification(
                            $managerId,
                            $managerMessage,
                            'task_completed',
                            get_class($task),
                            $task->id
                        );
                        Log::info('Task completion notification sent to project manager', [
                            'task_id' => $task->id, 'manager_id' => $managerId
                        ]);
                    }
                }
            } catch (\Exception $e) {
                Log::error('Error in status update notifications', [
                    'error' => $e->getMessage(), 'task_id' => $task->id
                ]);
            }
        }
        // --- End Notification Logic ---


        // Return the updated task with its relationships
        // Use the already refreshed task object
        $updatedTask = $task->load(['project', 'user']);

        Log::info('Task update process finished, returning response.', [
            'task_id' => $id,
            'updated_task_data' => $updatedTask->toArray()
        ]);

        return response()->json([
            'message' => 'Task updated successfully',
            'task' => $updatedTask,
        ]);
    }


    public function destroy($id)
    {
        if (Auth::user()->role !== 'project_manager') {
            return response()->json(['message' => 'Unauthorized. Only project managers can delete tasks.'], 403);
        }

        $task = Task::findOrFail($id);

        // Optional: Delete related comments or files if needed (using model events is better)
        // $task->comments()->delete();
        // $task->files()->delete(); // Assuming a 'files' relationship exists

        $task->delete();
        Log::info('Task deleted successfully.', ['task_id' => $id, 'deleted_by' => Auth::id()]);
        return response()->json(['message' => 'Task deleted']);
    }

    public function assignTask(Request $request, $id)
    {
        // This method might be redundant if the main update method handles assignment well.
        // Keeping it for potential specific use cases or simpler assignment UI.
        if (Auth::user()->role !== 'project_manager') {
            return response()->json(['message' => 'Unauthorized. Only project managers can assign tasks.'], 403);
        }

        $validated = $request->validate([
            'assigned_to' => 'required|exists:klick_users,id'
        ]);

        $task = Task::findOrFail($id);
        $oldAssignedTo = $task->assigned_to;

        if ($oldAssignedTo != $validated['assigned_to']) {
            $task->assigned_to = $validated['assigned_to'];
            $task->save(); // Save the change

            // Send notification
            try {
                $assignedUser = User::find($validated['assigned_to']);
                if ($assignedUser) {
                    NotificationService::notifyTaskAssigned($task, $assignedUser, Auth::user()); // Pass assigner
                }
            } catch (\Exception $e) {
                Log::error('Failed to send task assignment notification (assignTask method): ' . $e->getMessage());
            }

             // Reload the task to include relationships
            $task = $task->fresh()->load(['project', 'user']);
            return response()->json([
                'message' => 'Task assigned successfully',
                'task' => $task
            ]);

        } else {
             // Reload the task to include relationships even if no change
             $task = $task->fresh()->load(['project', 'user']);
             return response()->json([
                'message' => 'Task already assigned to this user.',
                'task' => $task // Return current task state
            ], 200); // Or 400 Bad Request? 200 seems fine.
        }
    }


public function show($id)
{
    try {
        // Eager load necessary relationships for the detail view
        $task = Task::with([
            'project' => function($query) {
                $query->select('id', 'project_name', 'project_code', 'user_id'); // Keep this specific
            },
            // 'user' => function($query) {  // <-- Temporarily comment out the specific select
            //     $query->select('id', 'name', 'username');
            // },
            'user', // <--- Load the full user object instead for testing
            'comments' => function($query) {
                $query->with(['user' => function($q) {
                    $q->select('id', 'username'); // Keep this specific
                }])->latest();
            }
            // Add 'files' relationship if you have file attachments
        ])->findOrFail($id);

        // Log the task data being returned, specifically the user part
        Log::debug('Task data being returned from show method', [
            'task_id' => $id,
            'task_data' => $task->toArray() // Convert to array for easier logging
        ]);

        return response()->json($task);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
         Log::warning('Task not found for show request.', ['task_id' => $id]);
         return response()->json(['message' => 'Task not found.'], 404);
    } catch (\Exception $e) {
        Log::error('Error fetching task details (show method)', [
            'task_id' => $id,
            'error' => $e->getMessage()
        ]);
        return response()->json(['message' => 'Error retrieving task details.'], 500);
    }
}

    // getComments, addComment, deleteComment methods remain largely the same...
    // Ensure they use logging and consistent error handling.

    /**
     * Get all comments for a task
     */
    public function getComments($taskId)
    {
        try {
            // Find the task first to ensure it exists
            Task::findOrFail($taskId);

            $comments = Comment::where('task_id', $taskId)
                ->with(['user' => function($query) {
                    $query->select('id', 'username'); // Select only needed fields
                }])
                ->latest() // Order by newest first
                ->get()
                ->map(function($comment) { // Map to ensure consistent structure and handle missing user
                    return [
                        'id' => $comment->id,
                        'user_id' => $comment->user_id,
                        'task_id' => $comment->task_id,
                        'comment' => $comment->comment,
                        'created_at' => $comment->created_at,
                        'updated_at' => $comment->updated_at,
                        'user' => $comment->user ? [
                            'id' => $comment->user->id,
                            'name' => $comment->user->username // Use username for consistency with other parts
                        ] : ['id' => null, 'name' => 'Unknown User'] // Provide fallback
                    ];
                });

            return response()->json($comments);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
             Log::warning('Task not found for getComments request.', ['task_id' => $taskId]);
             return response()->json(['message' => 'Task not found.'], 404);
        } catch (\Exception $e) {
            Log::error('Error fetching comments: ' . $e->getMessage(), [
                'task_id' => $taskId, 'exception' => $e
            ]);
            return response()->json(['error' => 'Failed to fetch comments'], 500);
        }
    }

    /**
     * Add a comment to a task
     */
    public function addComment(Request $request, $taskId)
    {
        try {
            $validated = $request->validate([
                'comment' => 'required|string|max:1000',
            ]);

            $task = Task::with(['project.user', 'user'])->findOrFail($taskId); // Load relations needed for notifications
            $commenter = Auth::user();

            $comment = $task->comments()->create([
                'comment' => $validated['comment'],
                'user_id' => $commenter->id,
            ]);

            // --- Comment Notification Logic ---
            try {
                 $projectManager = $task->project?->user; // Optional chaining
                 $assignedUser = $task->user;
                 $recipients = [];

                 // Notify PM if commenter is assignee (and PM exists and is not commenter)
                 if ($projectManager && $commenter->id === $assignedUser?->id && $projectManager->id !== $commenter->id) {
                     $recipients[] = $projectManager->id;
                 }
                 // Notify Assignee if commenter is PM (and assignee exists and is not commenter)
                 elseif ($assignedUser && $commenter->id === $projectManager?->id && $assignedUser->id !== $commenter->id) {
                     $recipients[] = $assignedUser->id;
                 }
                 // Notify both if commenter is someone else (and PM/Assignee exist and are not commenter)
                 else {
                     if ($projectManager && $projectManager->id !== $commenter->id) {
                         $recipients[] = $projectManager->id;
                     }
                     if ($assignedUser && $assignedUser->id !== $commenter->id && !in_array($assignedUser->id, $recipients)) {
                         $recipients[] = $assignedUser->id;
                     }
                 }

                 // Send notifications
                 foreach (array_unique($recipients) as $recipientId) {
                     NotificationService::notifyNewComment($comment, $task, $commenter, $recipientId);
                 }
                 if (!empty($recipients)) {
                    Log::info('Comment notification sent.', ['task_id' => $taskId, 'comment_id' => $comment->id, 'recipients' => $recipients]);
                 }

            } catch (\Exception $e) {
                Log::error('Failed to send comment notification: ' . $e->getMessage(), [
                    'task_id' => $taskId, 'comment_id' => $comment->id, 'commenter_id' => $commenter->id
                ]);
            }
            // --- End Comment Notification Logic ---


            // Load user for the response, selecting only necessary fields
            $comment->load(['user' => fn($q) => $q->select('id', 'username')]);

            // Map for consistent response structure
            $commentData = [
                'id' => $comment->id,
                'user_id' => $comment->user_id,
                'task_id' => $comment->task_id,
                'comment' => $comment->comment,
                'created_at' => $comment->created_at,
                'updated_at' => $comment->updated_at,
                'user' => $comment->user ? [
                    'id' => $comment->user->id,
                    'name' => $comment->user->username
                ] : ['id' => null, 'name' => 'Unknown User']
            ];

            return response()->json([
                'message' => 'Comment added successfully',
                'comment' => $commentData
            ], 201);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
             Log::warning('Task not found for addComment request.', ['task_id' => $taskId]);
             return response()->json(['message' => 'Task not found.'], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Validation failed for adding comment.', [
                'task_id' => $taskId, 'user_id' => auth()->id(), 'errors' => $e->errors()
            ]);
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error adding comment: ' . $e->getMessage(), [
                'exception' => $e, 'task_id' => $taskId, 'user_id' => auth()->id()
            ]);
            return response()->json(['error' => 'Failed to add comment'], 500);
        }
    }

    /**
     * Delete a comment
     */
    public function deleteComment($taskId, $commentId)
    {
        try {
            $comment = Comment::where('task_id', $taskId)
                ->findOrFail($commentId); // Find comment within the task scope

            // Authorization: Only comment owner or project manager can delete
            $user = Auth::user();

            // Simple check: is user the owner OR is user a PM?
            // Note: This allows *any* PM to delete *any* comment. Refine if needed
            // e.g., check if PM owns the project the task belongs to.
            // $task = Task::find($taskId); // Fetch task only if needed for more complex auth
            // $isProjectManagerOfThisTask = $user->role === 'project_manager' && $task && $task->project?->user_id === $user->id;

            if ($user->id !== $comment->user_id && $user->role !== 'project_manager') {
                 Log::warning('Unauthorized comment deletion attempt.', [
                    'comment_id' => $commentId, 'task_id' => $taskId, 'user_id' => $user->id
                 ]);
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $comment->delete();
            Log::info('Comment deleted successfully.', [
                'comment_id' => $commentId, 'task_id' => $taskId, 'deleted_by_user_id' => $user->id
            ]);
            return response()->json(['message' => 'Comment deleted']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
             Log::warning('Comment or Task not found for deletion.', [
                 'comment_id' => $commentId, 'task_id' => $taskId
             ]);
             return response()->json(['message' => 'Comment not found.'], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting comment: ' . $e->getMessage(), [
                'comment_id' => $commentId, 'task_id' => $taskId, 'user_id' => auth()->id(), 'exception' => $e
            ]);
            return response()->json(['message' => 'Failed to delete comment.'], 500);
        }
    }

}