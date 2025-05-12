<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\File;
use App\Models\Task;
// use App\Models\Project; // Keep for future use if attaching files to projects
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FileController extends Controller
{
    /**
     * Helper function to check if a user can access/manage a task's files.
     *
     * @param \App\Models\User $user
     * @param Task $task
     * @return bool
     */
    private function canUserAccessTaskFiles($user, Task $task): bool
    {
        if (!$user || !$task) {
            return false;
        }

        // Project Manager of the task's project
        if ($user->role === 'project_manager' && $task->project && $task->project->user_id === $user->id) {
            return true;
        }

        // User assigned to the task
        if ($task->assigned_to === $user->id) {
            return true;
        }
        
        // Add other conditions if team members of the same project (not just assignee) should access
        // For example, if $user is part of $task->project->teamMembers() (if such a relationship exists)

        return false;
    }

    /**
     * Upload a file for a specific task.
     *
     * @param Request $request
     * @param Task $task
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadForTask(Request $request, Task $task)
    {
        $user = Auth::user();

        // Authorization: PM of the project or assignee of the task can upload.
        if (!$this->canUserAccessTaskFiles($user, $task)) {
            return response()->json(['message' => 'Unauthorized to upload files for this task.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx,txt|max:10240', // Max 10MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $uploadedFile = $request->file('file');
        $originalFilename = $uploadedFile->getClientOriginalName();
        $storedFilename = $uploadedFile->store('task_attachments', 'public');

        if (!$storedFilename) {
            return response()->json(['message' => 'Failed to store file.'], 500);
        }

        $file = $task->files()->create([
            'user_id' => $user->id,
            'original_filename' => $originalFilename,
            'stored_filename' => $storedFilename,
            'mime_type' => $uploadedFile->getClientMimeType(),
            'size' => $uploadedFile->getSize(),
            'disk' => 'public',
        ]);

        $file->load('user:id,username');

        return response()->json([
            'message' => 'File uploaded successfully.',
            'file' => $file
        ], 201);
    }

    /**
     * Get all files for a specific task.
     *
     * @param Task $task
     * @return \Illuminate\Http\JsonResponse
     */
    public function getForTask(Task $task)
    {
        $user = Auth::user();

        // Authorization: PM of the project or assignee of the task can view files.
        if (!$this->canUserAccessTaskFiles($user, $task)) {
             // Allow uploader to see files they uploaded even if not assignee/PM (edge case, usually covered by above)
            $isUploaderForAnyFile = $task->files()->where('user_id', $user->id)->exists();
            if (!$isUploaderForAnyFile) {
                 return response()->json(['message' => 'Unauthorized to view files for this task.'], 403);
            }
        }

        $files = $task->files()->with('user:id,username')->latest()->get();

        $files->transform(function ($file) {
            if ($file->disk && $file->stored_filename) {
                $file->url = Storage::disk($file->disk)->url($file->stored_filename);
            } else {
                $file->url = null;
            }
            return $file;
        });

        return response()->json($files);
    }

    /**
     * Download a specific file.
     *
     * @param File $file The File model instance (route model binding)
     * @return \Symfony\Component\HttpFoundation\StreamedResponse|\Illuminate\Http\JsonResponse
     */
    public function downloadFile(File $file)
    {
        $user = Auth::user();
        $canDownload = false;

        // Rule 1: Uploader can download their own file.
        if ($user->id === $file->user_id) {
            $canDownload = true;
        }
        // Rule 2: If the file is attached to a Task, check task access permissions.
        else if ($file->fileable_type === Task::class && $file->fileable instanceof Task) {
            /** @var Task $task */
            $task = $file->fileable;
            if ($this->canUserAccessTaskFiles($user, $task)) {
                $canDownload = true;
            }
        }
        // Future: Add similar logic if files are directly attached to Projects
        // else if ($file->fileable_type === Project::class && $file->fileable instanceof Project) { ... }


        if (!$canDownload) {
            return response()->json(['message' => 'Unauthorized to download this file.'], 403);
        }

        if (!Storage::disk($file->disk)->exists($file->stored_filename)) {
            return response()->json(['message' => 'File not found on disk.'], 404);
        }

        return Storage::disk($file->disk)->download($file->stored_filename, $file->original_filename);
    }

    /**
     * Delete a specific file.
     *
     * @param File $file The File model instance (route model binding)
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteFile(File $file)
    {
        $user = Auth::user();
        $canDelete = false;

        // Rule 1: Uploader can delete their own file.
        if ($user->id === $file->user_id) {
            $canDelete = true;
        }
        // Rule 2: Project Manager can delete files associated with tasks in their projects.
        else if ($user->role === 'project_manager') {
            if ($file->fileable_type === Task::class && $file->fileable instanceof Task) {
                /** @var Task $task */
                $task = $file->fileable;
                if ($task->project && $task->project->user_id === $user->id) {
                    $canDelete = true;
                }
            }
            // Future: Add similar logic if files are directly attached to Projects
            // else if ($file->fileable_type === Project::class && $file->fileable instanceof Project) { ... }
        }

        if (!$canDelete) {
            return response()->json(['message' => 'Unauthorized to delete this file.'], 403);
        }

        Storage::disk($file->disk)->delete($file->stored_filename);
        $file->delete();

        return response()->json(['message' => 'File deleted successfully.']);
    }
}