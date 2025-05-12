<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\File;
use App\Models\Project; // Ensure this is imported
use App\Models\Task;
use App\Models\User; // Ensure this is imported
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FileController extends Controller
{
    /**
     * Helper function to check if a user has rights to access resources related to a specific project.
     * A user has access if they are the Project Manager or are assigned to any task within that project.
     *
     * @param User $user
     * @param Project $project
     * @return bool
     */
    private function canUserAccessProjectResources(User $user, Project $project): bool
    {
        if (!$user || !$project) {
            return false;
        }

        // Rule 1: Project Manager of the project
        if ($user->role === 'project_manager' && $project->user_id === $user->id) {
            return true;
        }

        // Rule 2: User is assigned to at least one task within this project
        $isAssignedToTaskInProject = Task::where('project_id', $project->id)
                                         ->where('assigned_to', $user->id)
                                         ->exists();
        if ($isAssignedToTaskInProject) {
            return true;
        }

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

        // Authorization: User must have access to the task's project resources.
        // (This implicitly covers PM and task assignees, and other project members)
        if (!$task->project || !$this->canUserAccessProjectResources($user, $task->project)) {
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

        // Authorization: User must have access to the task's project resources.
        if (!$task->project || !$this->canUserAccessProjectResources($user, $task->project)) {
             return response()->json(['message' => 'Unauthorized to view files for this task.'], 403);
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
     * Get all files associated with tasks within a specific project.
     *
     * @param Project $project
     * @return \Illuminate\Http\JsonResponse
     */
    public function getForProject(Project $project)
    {
        $user = Auth::user();

        // Authorization: User must have access to the project resources.
        if (!$this->canUserAccessProjectResources($user, $project)) {
            return response()->json(['message' => 'Unauthorized to view files for this project.'], 403);
        }

        $files = File::whereHasMorph('fileable', [Task::class], function ($query) use ($project) {
            $query->where('project_id', $project->id);
        })->with('user:id,username', 'fileable:id,title,project_id')
          ->latest()
          ->get();

        $files->transform(function ($file) {
            if ($file->disk && $file->stored_filename) {
                $file->url = Storage::disk($file->disk)->url($file->stored_filename);
            } else {
                $file->url = null;
            }
            if ($file->fileable_type === Task::class && $file->fileable) {
                $file->task_title = $file->fileable->title;
                $file->task_id = $file->fileable->id;
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
        // Rule 2: If the file is attached to a Task, check project resource access for that task's project.
        else if ($file->fileable_type === Task::class && $file->fileable instanceof Task) {
            /** @var Task $task */
            $task = $file->fileable;
            if ($task->project && $this->canUserAccessProjectResources($user, $task->project)) {
                $canDownload = true;
            }
        }
        // Future: Add similar logic if files are directly attached to Projects and have different access rules.

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
        }

        if (!$canDelete) {
            return response()->json(['message' => 'Unauthorized to delete this file.'], 403);
        }

        Storage::disk($file->disk)->delete($file->stored_filename);
        $file->delete();

        return response()->json(['message' => 'File deleted successfully.']);
    }
}