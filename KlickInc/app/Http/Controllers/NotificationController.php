<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            $userId = $user->id;
            
            // Log user information
            Log::info('Fetching notifications for user', [
                'user_id' => $userId,
                'email' => $user->email,
                'role' => $user->role,
                'ip' => request()->ip(),
                'url' => request()->fullUrl()
            ]);
            
            // Get pagination parameters
            $perPage = min(request('per_page', 10), 50); // Max 50 per page
            $page = max(1, (int) request('page', 1));
            
            // Log the raw SQL query for debugging
            DB::enableQueryLog();
            
            // Use the new scope to ensure we get all notifications for this user
            $query = Notification::forUser($user->id)
                ->with(['notifiable'])
                ->orderBy('created_at', 'desc');
                
            Log::info('Using scope-based notification query', [
                'user_id' => $userId,
                'user_role' => $user->role
            ]);
            
            // Log user notifications relationship details
            Log::debug('User notifications relationship details', [
                'user_id' => $userId,
                'role' => $user->role,
                'notifications_method' => class_exists('\ReflectionMethod') ? (new \ReflectionMethod($user, 'notifications'))->getDocComment() : 'reflection not available',
                'notifiable_type' => get_class($user),
                'morphed_name' => 'notifiable',
            ]);
            
            // Log the raw SQL query
            $sql = $query->toSql();
            $bindings = $query->getBindings();
            Log::debug('Raw notifications query', [
                'sql' => $sql,
                'bindings' => $bindings
            ]);
            
            // Execute the query with pagination
            $notifications = $query->paginate($perPage, ['*'], 'page', $page);
            
            // Log the executed query details
            $queryLog = DB::getQueryLog();
            Log::debug('Executed notifications query', [
                'sql' => $queryLog[count($queryLog)-1]['query'] ?? 'No query logged',
                'bindings' => $queryLog[count($queryLog)-1]['bindings'] ?? [],
                'time' => $queryLog[count($queryLog)-1]['time'] ?? 0,
                'user_id' => $userId
            ]);
            
            // DIRECT APPROACH: If no notifications were found, try to get them directly based on user role
            if ($notifications->isEmpty()) {
                Log::info('No notifications found with regular approach, trying direct query');
                
                // For project managers, use a direct query approach as a fallback
                if ($user->role === 'project_manager') {
                    Log::info('Using direct query approach for project manager');
                    
                    // Try all possible formats of the notifiable_type with a direct query
                    $rawNotifications = DB::table('notifications')
                        ->where('notifiable_id', $userId)
                        ->where(function ($q) {
                            $q->where('notifiable_type', 'App\\Models\\User')
                              ->orWhere('notifiable_type', 'App\Models\User')
                              ->orWhere('notifiable_type', User::class);
                        })
                        ->orderBy('created_at', 'desc')
                        ->paginate($perPage, ['*'], 'page', $page);
                    
                    if ($rawNotifications->isNotEmpty()) {
                        Log::info('Found project manager notifications with direct query', [
                            'count' => $rawNotifications->count()
                        ]);
                        $notifications = $rawNotifications;
                        $notificationItems = $notifications->items();
                    }
                }
            }
            
            // Get total count for debugging
            $totalNotifications = $user->notifications()->count();
            $totalUnread = $user->notifications()->whereNull('read_at')->count();
            
            // Verify notifications data structure
            $notificationItems = $notifications->items();
            $notificationItems = array_map(function($notification) {
                // Ensure basic fields are set
                if (!isset($notification->id)) {
                    $notification->id = null;
                    Log::warning('Notification missing ID', ['notification' => $notification]);
                }
                if (!isset($notification->read_at)) {
                    $notification->read_at = null;
                }
                if (!isset($notification->created_at)) {
                    $notification->created_at = now()->toDateTimeString();
                    Log::warning('Notification missing created_at', ['notification' => $notification]);
                }
                return $notification;
            }, $notificationItems);
            
            // Format the response
            $response = [
                'data' => $notificationItems,
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'has_more' => $notifications->hasMorePages(),
                'next_page_url' => $notifications->nextPageUrl(),
                'prev_page_url' => $notifications->previousPageUrl(),
                'debug' => [
                    'user_id' => $userId,
                    'role' => $user->role,
                    'total_notifications' => $totalNotifications,
                    'total_unread' => $totalUnread,
                    'query' => $sql,
                    'bindings' => $bindings
                ]
            ];
            
            // Log notification details for debugging
            $notificationIds = collect($response['data'])->pluck('id')->toArray();
            Log::info('Returning notifications', [
                'user_id' => $userId,
                'notification_count' => count($response['data']),
                'notification_ids' => $notificationIds,
                'total' => $response['total'],
                'total_unread' => $totalUnread,
                'has_more' => $response['has_more'],
                'current_page' => $response['current_page'],
                'last_page' => $response['last_page']
            ]);
            
            return response()->json($response);
            
        } catch (\Exception $e) {
            Log::error('Error fetching notifications', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'data' => [],
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 10,
                'total' => 0,
            ]);
        }
    }

    /**
     * Mark a specific notification as read.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead($id)
    {
        try {
            $user = Auth::user();
            $notification = $user->notifications()->findOrFail($id);
            
            $notification->markAsRead();
            
            Log::info('Notification marked as read', [
                'notification_id' => $id,
                'user_id' => $user->id
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read',
                'notification' => $notification
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error marking notification as read', [
                'notification_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all notifications as read for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAllAsRead()
    {
        try {
            $user = Auth::user();
            
            // Using direct query approach for more reliable results
            $unreadNotifications = Notification::forUser($user->id)
                ->whereNull('read_at')
                ->get();
            
            $count = $unreadNotifications->count();
            
            Log::info('Marking all notifications as read (direct approach)', [
                'user_id' => $user->id,
                'user_role' => $user->role,
                'count' => $count
            ]);
            
            if ($count > 0) {
                foreach ($unreadNotifications as $notification) {
                    $notification->markAsRead();
                }
                
                Log::info('Marked all notifications as read', [
                    'user_id' => $user->id,
                    'user_role' => $user->role,
                    'count' => $count
                ]);
            }
            
            return response()->json([
                'success' => true,
                'message' => "Marked {$count} notifications as read",
                'count' => $count
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error marking all notifications as read', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notifications as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function unreadCount()
    {
        $user = Auth::user();
        
        // Log user information
        Log::info('Fetching unread count for user', [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $user->role
        ]);
        
        // FIRST: Direct raw query to see ALL notifications in the system
        $allNotifications = DB::table('notifications')->get();
        Log::info('ALL notifications in system', [
            'total_count' => $allNotifications->count(),
            'notification_ids' => $allNotifications->pluck('id')->toArray(),
            'notification_user_ids' => $allNotifications->pluck('notifiable_id')->toArray(),
        ]);
        
        // SECOND: Check all notifications for this specific user with multiple possible notifiable_type formats
        $rawUserNotifications = DB::table('notifications')
            ->where('notifiable_id', '=', $user->id)
            ->where(function($query) {
                // Check all possible formats of the notifiable_type
                $query->where('notifiable_type', '=', 'App\\Models\\User')
                      ->orWhere('notifiable_type', '=', 'App\Models\User')
                      ->orWhere('notifiable_type', '=', User::class);
            })
            ->get();
            
        // Direct raw SQL query to check what's actually in the database
        $allNotificationsRaw = DB::select('SELECT * FROM notifications LIMIT 10');
        Log::info('Raw SQL query results', [
            'count' => count($allNotificationsRaw),
            'first_few' => array_slice((array)$allNotificationsRaw, 0, 3)
        ]);
            
        Log::info('Raw user notifications check', [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'notification_count' => $rawUserNotifications->count(),
            'notification_ids' => $rawUserNotifications->pluck('id')->toArray(),
        ]);
        
        // THIRD: Now try with our scope
        $query = Notification::forUser($user->id)->whereNull('read_at');
        $sql = $query->toSql();
        $bindings = $query->getBindings();
        
        // Log the query and bindings
        Log::debug('Unread count query', [
            'sql' => $sql,
            'bindings' => $bindings
        ]);
        
        $count = $query->count();
        
        // Log the result
        Log::info('Unread count result', [
            'user_id' => $user->id,
            'count' => $count
        ]);
        
        return response()->json([
            'count' => $count,
            'debug' => [
                'user_id' => $user->id,
                'user_role' => $user->role,
                'total_notifications' => $allNotifications->count(),
                'user_notifications' => $rawUserNotifications->count(),
                'query' => $sql,
                'bindings' => $bindings
            ]
        ]);
    }
}
