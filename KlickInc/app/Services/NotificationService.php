<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public static function createNotification($userId, $message, $type, $notifiableType, $notifiableId)
    {
        \Log::info('Creating notification', [
            'user_id' => $userId,
            'type' => $type,
            'notifiable_type' => $notifiableType,
            'notifiable_id' => $notifiableId,
            'message' => $message,
            'caller' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2)[1]['function'] ?? 'unknown'
        ]);
        
        try {
            // Get the user to attach the notification to
            $user = User::findOrFail($userId);
            
            // Log user role - important for debugging project manager issues
            \Log::info('Creating notification for user', [
                'user_id' => $userId,
                'user_role' => $user->role ?? 'unknown',
                'username' => $user->username ?? 'unknown',
                'is_project_manager' => ($user->role === 'project_manager') ? 'yes' : 'no'
            ]);
            
            // DIRECT APPROACH: Create the notification with explicit attributes
            // This bypasses potential polymorphic relationship issues
            $notification = new \App\Models\Notification([
                'message' => $message,
                'type' => $type,
                'notifiable_type' => 'App\Models\User', // Use consistent string format
                'notifiable_id' => $userId,
                'read_at' => null // Explicitly set to ensure it's unread
            ]);
            
            // Log exactly what we're saving to help debug
            \Log::info('About to save notification with data', [
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $userId,
                'message' => $message,
                'type' => $type
            ]);
            
            $notification->save();
            
            // Reload the notification to ensure data consistency
            $notification = $notification->fresh();
            
            \Log::info('Notification created successfully', [
                'notification_id' => $notification->id,
                'user_id' => $userId,
                'user_role' => $user->role ?? 'unknown',
                'notifiable_type' => $notification->notifiable_type,
                'notifiable_id' => $notification->notifiable_id,
                'type' => $notification->type,
                'created_at' => $notification->created_at
            ]);
            
            return $notification;
        } catch (\Exception $e) {
            \Log::error('Failed to create notification', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $userId,
                'type' => $type
            ]);
            throw $e;
        }
    }
    
    /**
     * Create a task completion notification specifically for project managers
     * 
     * @param Task $task The completed task
     * @param User $completedBy The user who completed the task
     * @return Notification|null The created notification or null if failed
     */
    public static function notifyTaskCompleted($task, $completedBy = null)
    {
        try {
            \Log::info('notifyTaskCompleted called', [
                'task_id' => $task->id,
                'completedBy' => $completedBy ? $completedBy->id : 'null'
            ]);
            
            // Ensure task project relation is loaded
            if (!$task->relationLoaded('project')) {
                $task->load('project');
            }
            
            // First check: Verify task has a project and project has a user_id
            if (!$task->project || !$task->project->user_id) {
                \Log::warning('Cannot create task completion notification: missing project or project manager', [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'has_project' => $task->project ? 'yes' : 'no',
                    'project_id' => $task->project_id ?? null,
                    'project' => $task->project ? json_encode($task->project->toArray()) : 'null',
                    'project_manager_id' => $task->project ? $task->project->user_id : null
                ]);
                
                // Second check: If we have a project_id but not a loaded project, try to get the project directly
                if ($task->project_id) {
                    $project = \App\Models\Project::find($task->project_id);
                    if ($project && $project->user_id) {
                        \Log::info('Found project directly', [
                            'project_id' => $project->id,
                            'project_name' => $project->project_name,
                            'user_id' => $project->user_id
                        ]);
                        $task->project = $project; // Assign the project to the task's relation
                    } else {
                        \Log::warning('Project found but no user_id set', [
                            'project_id' => $project ? $project->id : null,
                            'has_user_id' => $project && $project->user_id ? 'yes' : 'no'
                        ]);
                        return null;
                    }
                } else {
                    return null;
                }
            }
            
            // Get the project manager's user ID
            $projectManagerId = $task->project->user_id;
            
            // Get user who completed the task for the message
            $completedByName = 'a team member';
            if ($completedBy) {
                $completedByName = $completedBy->username ?? $completedBy->name ?? 'a team member';
            } elseif ($task->assignedUser) {
                $completedByName = $task->assignedUser->username ?? $task->assignedUser->name ?? 'a team member';
            }
            
            $message = "Task '{$task->title}' has been marked as completed by {$completedByName}";
            
            // Log detailed information about this notification creation attempt
            \Log::info('Creating task completion notification for project manager', [
                'project_manager_id' => $projectManagerId,
                'task_id' => $task->id,
                'task_title' => $task->title,
                'completed_by' => $completedByName,
                'message' => $message
            ]);
            
            // Create the notification
            return self::createNotification(
                $projectManagerId,
                $message,
                'task_completed',
                'App\Models\Task',  // Use the task as the notifiable entity type
                $task->id
            );
        } catch (\Exception $e) {
            \Log::error('Failed to create task completion notification', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'task_id' => $task->id ?? 'unknown'
            ]);
            return null;
        }
    }

    public static function notifyTaskAssigned($task, $assignedTo)
    {
        $message = "You have been assigned a new task: {$task->title}";
        return self::createNotification(
            $assignedTo->id,
            $message,
            'task_assigned',
            get_class($task),
            $task->id
        );
    }

    public static function notifyNewComment($comment, $task, $commenter, $recipientId = null)
    {
        try {
            // Load the task with project and assigned user if not already loaded
            if (!$task->relationLoaded('project')) {
                $task->load('project');
            }
            if (!$task->relationLoaded('user')) {
                $task->load('user');
            }
            
            // If recipient ID is not provided, determine it
            if (!$recipientId) {
                // If the commenter is the assignee, notify the project manager
                if ($commenter->id === $task->assigned_to && $task->project) {
                    $recipientId = $task->project->user_id;
                } 
                // If the commenter is the project manager, notify the assignee
                else if ($task->assigned_to) {
                    $recipientId = $task->assigned_to;
                }
                // Fallback to project manager if no assignee
                else if ($task->project) {
                    $recipientId = $task->project->user_id;
                }
            }
            
            if (!$recipientId) {
                \Log::warning('No recipient found for comment notification', [
                    'comment_id' => $comment->id,
                    'task_id' => $task->id,
                    'commenter_id' => $commenter->id
                ]);
                return null;
            }
            
            // Skip if the commenter is the same as the recipient
            if ($commenter->id === $recipientId) {
                return null;
            }
            
            $message = $commenter->username . " commented on task: {$task->title}";
            
            \Log::info('Sending comment notification', [
                'comment_id' => $comment->id,
                'task_id' => $task->id,
                'commenter_id' => $commenter->id,
                'recipient_id' => $recipientId,
                'message' => $message
            ]);
            
            return self::createNotification(
                $recipientId,
                $message,
                'new_comment',
                get_class($comment),
                $comment->id
            );
        } catch (\Exception $e) {
            \Log::error('Error in notifyNewComment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'comment_id' => $comment->id ?? null,
                'task_id' => $task->id ?? null,
                'commenter_id' => $commenter->id ?? null
            ]);
            return null;
        }
    }
}
