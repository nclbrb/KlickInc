<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Task;
use App\Models\Project;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FixAndVerifyNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fixes notification setup issues and verifies proper configurations';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Starting notification system repair and verification...');
        
        // Step 1: Check projects to ensure they have a project manager assigned
        $this->fixProjectRelationships();
        
        // Step 2: Verify notification types are consistent
        $this->standardizeNotificationTypes();
        
        // Step 3: Create test notifications to verify functionality
        $this->createTestNotifications();
        
        $this->info('Notification system repair and verification completed successfully!');
        
        return Command::SUCCESS;
    }
    
    /**
     * Verify and fix project manager relationships
     */
    private function fixProjectRelationships()
    {
        $this->info("\n[1] Checking and fixing project manager relationships...");
        
        $projects = Project::all();
        $projectManagers = User::where('role', 'project_manager')->get();
        
        if ($projectManagers->isEmpty()) {
            $this->error('No project managers found in the system!');
            return;
        }
        
        $defaultPM = $projectManagers->first();
        $this->info("Found {$projects->count()} projects and {$projectManagers->count()} project managers");
        
        $fixedCount = 0;
        
        foreach ($projects as $project) {
            if (!$project->user_id) {
                $project->user_id = $defaultPM->id;
                $project->save();
                $this->line("  - Fixed project #{$project->id} ({$project->project_name}): assigned to PM {$defaultPM->username}");
                $fixedCount++;
            }
        }
        
        $this->info("Fixed $fixedCount project(s) without assigned project managers");
        
        // Now verify each task has proper project relationship
        $tasksWithoutProjects = Task::whereNull('project_id')->count();
        if ($tasksWithoutProjects > 0) {
            $this->warn("Found $tasksWithoutProjects tasks without project assignment");
        }
    }
    
    /**
     * Standardize notification types in the database
     */
    private function standardizeNotificationTypes()
    {
        $this->info("\n[2] Standardizing notification types...");
        
        $inconsistentTypes = DB::table('notifications')
            ->whereNot('notifiable_type', 'App\Models\User')
            ->count();
            
        if ($inconsistentTypes > 0) {
            $this->warn("Found $inconsistentTypes notifications with inconsistent type format");
            // Fix them
            DB::table('notifications')
                ->update(['notifiable_type' => 'App\Models\User']);
            $this->info("✓ Standardized all notification types to 'App\Models\User'");
        } else {
            $this->info("✓ All notification types are consistent");
        }
    }
    
    /**
     * Create test notifications for each notification type
     */
    private function createTestNotifications()
    {
        $this->info("\n[3] Creating test notifications for verification...");
        
        // Find project manager to send notifications to
        $projectManager = User::where('role', 'project_manager')->first();
        if (!$projectManager) {
            $this->error('No project manager found to create test notifications for!');
            return;
        }
        
        $this->info("Creating test notifications for project manager: {$projectManager->username} (ID: {$projectManager->id})");
        
        // Create task completion notification
        $taskNotification = new Notification([
            'message' => 'TEST: A task has been marked as completed',
            'type' => 'task_completed',
            'notifiable_type' => 'App\Models\User',
            'notifiable_id' => $projectManager->id,
            'read_at' => null
        ]);
        $taskNotification->save();
        
        // Create comment notification
        $commentNotification = new Notification([
            'message' => 'TEST: New comment on a task',
            'type' => 'new_comment',
            'notifiable_type' => 'App\Models\User',
            'notifiable_id' => $projectManager->id,
            'read_at' => null
        ]);
        $commentNotification->save();
        
        // Create assignment notification
        $assignmentNotification = new Notification([
            'message' => 'TEST: You have been assigned a new task',
            'type' => 'task_assigned',
            'notifiable_type' => 'App\Models\User',
            'notifiable_id' => $projectManager->id,
            'read_at' => null
        ]);
        $assignmentNotification->save();
        
        $this->info("✓ Created test notifications with IDs: {$taskNotification->id}, {$commentNotification->id}, {$assignmentNotification->id}");
        
        // Check if notifications are retrievable via the same query used in NotificationController
        $retrievedNotifications = DB::table('notifications')
            ->where('notifiable_id', $projectManager->id)
            ->where(function($query) {
                $query->where('notifiable_type', 'App\Models\User')
                    ->orWhere('notifiable_type', 'App\\Models\\User')
                    ->orWhere('notifiable_type', User::class);
            })
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
            
        $this->info("Retrieved {$retrievedNotifications->count()} notifications for project manager");
        foreach ($retrievedNotifications as $index => $notification) {
            $this->line("  " . ($index + 1) . ". [{$notification->type}] {$notification->message}");
        }
    }
}
