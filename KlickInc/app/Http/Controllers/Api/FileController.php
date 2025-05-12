<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\File;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FileController extends Controller
{
    /**
     * Upload a file for a specific task.
     *
     * @param Request $request
     * @param Task $task
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadForTask(Request $request, Task $task)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx,txt|max:10240', // Max 10MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $uploadedFile = $request->file('file');
        $originalFilename = $uploadedFile->getClientOriginalName();
        // Stores in 'storage/app/public/task_attachments'
        $storedFilename = $uploadedFile->store('task_attachments', 'public');

        if (!$storedFilename) {
            return response()->json(['message' => 'Failed to store file.'], 500);
        }

        $file = $task->files()->create([
            'user_id' => Auth::id(),
            'original_filename' => $originalFilename,
            'stored_filename' => $storedFilename,
            'mime_type' => $uploadedFile->getClientMimeType(),
            'size' => $uploadedFile->getSize(),
            'disk' => 'public',
        ]);

        $file->load('user:id,username'); // Eager load uploader for the response

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
        // Eager load the user who uploaded the file
        $files = $task->files()->with('user:id,username')->latest()->get();

        // Add a direct URL for each file for easier frontend access
        $files->transform(function ($file) {
            if ($file->disk && $file->stored_filename) {
                $file->url = Storage::disk($file->disk)->url($file->stored_filename);
            } else {
                $file->url = null; // Or some default placeholder
            }
            return $file;
        });

        return response()->json($files);
    }

    /**
     * Download a specific file.
     *
     * @param File $file
     * @return \Symfony\Component\HttpFoundation\StreamedResponse|\Illuminate\Http\JsonResponse
     */
    public function downloadFile(File $file)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!Storage::disk($file->disk)->exists($file->stored_filename)) {
            return response()->json(['message' => 'File not found on disk.'], 404);
        }

        return Storage::disk($file->disk)->download($file->stored_filename, $file->original_filename);
    }

    /**
     * Delete a specific file.
     *
     * @param File $file
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
            if ($file->fileable_type === Task::class) {
                $task = $file->fileable; // This is the Task model instance
                if ($task && $task->project && $task->project->user_id === $user->id) {
                    $canDelete = true;
                }
            }
            // Future: Add similar logic if files are directly attached to Projects
            // else if ($file->fileable_type === Project::class) { ... }
        }

        if (!$canDelete) {
            return response()->json(['message' => 'Unauthorized to delete this file.'], 403);
        }

        // Delete the physical file from storage
        Storage::disk($file->disk)->delete($file->stored_filename);

        // Delete the file record from the database
        $file->delete();

        return response()->json(['message' => 'File deleted successfully.']);
    }
}