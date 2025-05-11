<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Task;
use App\Services\NotificationService;

class CreateTestNotification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-test-notification {user_id=1 : The ID of the user to create notification for}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a test notification for a specific user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('user_id');
        
        try {
            // Find the user
            $user = User::findOrFail($userId);
            $this->info("Creating test notification for user: {$user->username} (ID: {$user->id}, Role: {$user->role})");
            
            // Create direct notification using our fixed method
            $notification = new \App\Models\Notification([
                'message' => 'This is a test notification from the command line',
                'type' => 'test_notification',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $userId,
                'read_at' => null
            ]);
            
            $notification->save();
            
            $this->info("✅ Test notification created successfully!");
            $this->info("Notification ID: {$notification->id}");
            
            // Check if the notification can be found
            $foundNotification = \DB::table('notifications')
                ->where('id', $notification->id)
                ->first();
                
            if ($foundNotification) {
                $this->info("✓ Notification verified in database");
            } else {
                $this->error("× Notification not found in database after creation!");
            }
            
        } catch (\Exception $e) {
            $this->error("Error creating test notification: {$e->getMessage()}");
            $this->line($e->getTraceAsString());
        }
        
        // Now check if the notification is visible via the query we use in the controller
        $this->info("\nTesting if notification is visible via query:");
        
        try {
            // This is the query we use in the NotificationController
            $visibleNotifications = \DB::table('notifications')
                ->where('notifiable_id', $userId)
                ->where(function($query) {
                    $query->where('notifiable_type', 'App\Models\User')
                          ->orWhere('notifiable_type', 'App\\Models\\User')
                          ->orWhere('notifiable_type', \App\Models\User::class);
                })
                ->get();
                
            $this->info("Found {$visibleNotifications->count()} notifications for user {$userId} via controller query");
            
            if ($visibleNotifications->isEmpty()) {
                $this->error("× No notifications found via controller query - this explains the issue!");
            } else {
                $this->info("✓ Notifications are visible via controller query");
                $this->line("Latest notification: {$visibleNotifications->first()->message}");
            }
        } catch (\Exception $e) {
            $this->error("Error testing visibility: {$e->getMessage()}");
        }
    }
}
