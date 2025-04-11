<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if ($user->role === 'project_manager') {
            return Task::with(['project', 'user'])->get();
        }
        return Task::with(['project', 'user'])->where('assigned_to', $user->id)->get();
    }

    public function store(Request $request)
    {
        if (Auth::user()->role !== 'project_manager') {
            return response()->json(['message' => 'Unauthorized. Only project managers can create tasks.'], 403);
        }

        // Validate 
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'assigned_to' => 'required|exists:klick_users,id',
            'project_id' => 'required|exists:projects,id',
            'status' => 'required|string',
            'priority' => 'nullable|string',
            'deadline' => 'nullable|date', 
        ]);

        // Create the task with the validated data
        $task = Task::create($validated);
        return response()->json($task->load(['project', 'user']), 201);
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $user = Auth::user();

        // Project Manager can update any task
        if ($user->role === 'project_manager') {
            $validated = $request->validate([
                'title' => 'required|string',
                'description' => 'nullable|string',
                'assigned_to' => 'required|exists:klick_users,id',
                'project_id' => 'required|exists:projects,id',
                'status' => 'required|string',
                'priority' => 'nullable|string',
                'deadline' => 'nullable|date', 
            ]);
        } 
        // Team Member can only update tasks assigned to them
        elseif ($user->role === 'team_member' && $task->assigned_to == $user->id) {
            // Validate the request for team member 
            $validated = $request->validate([
                'status' => 'required|string|in:not_started,in_progress,completed',
                'deadline' => 'nullable|date',
            ]);
        } else {
            return response()->json(['message' => 'Unauthorized. You can only update your own tasks.'], 403);
        }

        // Update the task with the validated data
        $task->update($validated);

        return response()->json($task->load(['project', 'user']));
    }

    public function destroy($id)
    {
        if (Auth::user()->role !== 'project_manager') {
            return response()->json(['message' => 'Unauthorized. Only project managers can delete tasks.'], 403);
        }

        $task = Task::findOrFail($id);
        $task->delete();
        return response()->json(['message' => 'Task deleted']);
    }

    public function assignTask(Request $request, $id)
    {
        if (Auth::user()->role !== 'project_manager') {
            return response()->json(['message' => 'Unauthorized. Only project managers can assign tasks.'], 403);
        }

        $validated = $request->validate([
            'assigned_to' => 'required|exists:klick_users,id'
        ]);

        $task = Task::findOrFail($id);
        $task->assigned_to = $validated['assigned_to'];
        $task->save();

        return response()->json([
            'message' => 'Task assigned successfully',
            'task' => $task->load(['project', 'user'])
        ]);
    }

    public function show($id)
    {
        $task = Task::with(['project', 'user'])->findOrFail($id);
        return response()->json($task);
    }
}
