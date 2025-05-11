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
            
            // Create the notification using the polymorphic relationship
            $notification = $user->notifications()->create([
                'message' => $message,
                'type' => $type,
                'notifiable_type' => $notifiableType,
                'notifiable_id' => $notifiableId,
                'read_at' => null // Explicitly set to ensure it's unread
            ]);
            
            // Reload the notification with relationships to ensure data consistency
            $notification = $notification->fresh();
            
            \Log::info('Notification created successfully', [
                'notification_id' => $notification->id,
'user_id' => $userId,
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
