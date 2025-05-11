<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Notification;

class CheckNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-notifications {user_id? : Optional user ID to check notifications for}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check notification records in the database and diagnose issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting notification system diagnostic check...');
        
        // 1. First, check if the notifications table exists and has the expected structure
        $this->info('\n[1] Checking notifications table schema...');
        
        try {
            $columns = DB::getSchemaBuilder()->getColumnListing('notifications');
            $this->info('Notifications table exists with columns: ' . implode(', ', $columns));
            
            // Check essential columns
            $requiredColumns = ['id', 'notifiable_type', 'notifiable_id', 'type', 'message', 'read_at', 'created_at'];
            $missingColumns = array_diff($requiredColumns, $columns);
            
            if (!empty($missingColumns)) {
                $this->error('Missing required columns: ' . implode(', ', $missingColumns));
            } else {
                $this->info('All required columns present ✓');
            }
        } catch (\Exception $e) {
            $this->error('Error checking table schema: ' . $e->getMessage());
        }
        
        // 2. Check total notification count
        $this->info('\n[2] Checking notification counts...');
        
        try {
            $totalCount = DB::table('notifications')->count();
            $this->info("Total notifications in database: {$totalCount}");
            
            if ($totalCount === 0) {
                $this->warn('No notifications found in database! Notifications are not being created.');
            }
        } catch (\Exception $e) {
            $this->error('Error counting notifications: ' . $e->getMessage());
        }
        
        // 3. Check notifiable_type values
        $this->info('\n[3] Analyzing notifiable_type values...');
        
        try {
            $notifiableTypes = DB::table('notifications')
                ->select('notifiable_type')
                ->distinct()
                ->get()
                ->pluck('notifiable_type')
                ->toArray();
                
            $this->info('Distinct notifiable_type values found:');
            foreach ($notifiableTypes as $type) {
                $count = DB::table('notifications')->where('notifiable_type', $type)->count();
                $this->line(" - {$type}: {$count} notifications");
            }
            
            // Check if the expected User class is in the list
            $userClassFound = false;
            $expectedUserClasses = [User::class, 'App\Models\User', 'App\\Models\\User'];
            
            foreach ($expectedUserClasses as $expectedClass) {
                if (in_array($expectedClass, $notifiableTypes)) {
                    $userClassFound = true;
                    $this->info("✓ Found expected User class format: {$expectedClass}");
                }
            }
            
            if (!$userClassFound) {
                $this->error('User class format not found in notifiable_type values!');
                $this->line("Expected one of: " . implode(', ', $expectedUserClasses));
            }
        } catch (\Exception $e) {
            $this->error('Error analyzing notifiable_type values: ' . $e->getMessage());
        }
        
        // 4. Check notifications for project managers
        $this->info('\n[4] Checking notifications for project managers...');
        
        try {
            // Find project managers
            $projectManagers = User::where('role', 'project_manager')->get();
            
            if ($projectManagers->isEmpty()) {
                $this->warn('No project managers found in users table!');
            } else {
                $this->info('Found ' . $projectManagers->count() . ' project managers:');
                
                foreach ($projectManagers as $pm) {
                    $this->line(" - User ID: {$pm->id}, Name: {$pm->username}, Email: {$pm->email}");
                    
                    // Check notifications with various notifiable_type formats
                    $pmNotifications = DB::table('notifications')
                        ->where('notifiable_id', $pm->id)
                        ->where(function ($query) {
                            $query->where('notifiable_type', User::class)
                                  ->orWhere('notifiable_type', 'App\Models\User')
                                  ->orWhere('notifiable_type', 'App\\Models\\User');
                        })
                        ->get();
                    
                    $this->info("   Found {$pmNotifications->count()} notifications for this project manager");
                    
                    if ($pmNotifications->isEmpty()) {
                        $this->warn("   No notifications found for this project manager!");
                    } else {
                        $this->line("   Latest 3 notifications:");
                        foreach ($pmNotifications->take(3) as $notification) {
                            $readStatus = $notification->read_at ? 'Read' : 'Unread';
                            $this->line("   - {$notification->type}: {$notification->message} ({$readStatus})");
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            $this->error('Error checking project manager notifications: ' . $e->getMessage());
        }
        
        // 5. Check a specific user if requested
        if ($userId = $this->argument('user_id')) {
            $this->info("\n[5] Checking notifications for specific user ID: {$userId}");
            
            try {
                $user = User::find($userId);
                
                if (!$user) {
                    $this->error("User with ID {$userId} not found!");
                } else {
                    $this->info("User found: ID {$user->id}, Role: {$user->role}, Email: {$user->email}");
                    
                    // Check all possible notifiable_type formats
                    $userNotifications = DB::table('notifications')
                        ->where('notifiable_id', $userId)
                        ->where(function ($query) {
                            $query->where('notifiable_type', User::class)
                                  ->orWhere('notifiable_type', 'App\Models\User')
                                  ->orWhere('notifiable_type', 'App\\Models\\User');
                        })
                        ->orderBy('created_at', 'desc')
                        ->get();
                    
                    $this->info("Found {$userNotifications->count()} notifications for this user");
                    
                    if ($userNotifications->isEmpty()) {
                        $this->warn("No notifications found for this user!");
                    } else {
                        $this->line("Latest 5 notifications:");
                        foreach ($userNotifications->take(5) as $notification) {
                            $readStatus = $notification->read_at ? 'Read' : 'Unread';
                            $date = date('Y-m-d H:i:s', strtotime($notification->created_at));
                            $this->line(" - [{$date}] {$notification->type}: {$notification->message} ({$readStatus})");
                        }
                    }
                }
            } catch (\Exception $e) {
                $this->error('Error checking user notifications: ' . $e->getMessage());
            }
        }
        
        $this->info('\nNotification diagnostic check completed!');
    }
}
