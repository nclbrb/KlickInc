<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- ADD THIS IMPORT

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user(); // Or Auth::user();

        if ($user->role === 'team_member') {
            $projects = Project::whereHas('tasks', function ($query) use ($user) {
                $query->where('assigned_to', $user->id);
            })->with('user:id,username') // Eager load project manager info
              ->latest()
              ->get();
        } else { // Project Managers or other roles
            // If PM, only show their projects. If Admin, show all.
            if ($user->role === 'project_manager') {
                 $projects = Project::where('user_id', $user->id)
                                   ->with('user:id,username')
                                   ->latest()
                                   ->get();
            } else { // For other roles like admin, show all. Adjust if needed.
                $projects = Project::with('user:id,username')->latest()->get();
            }
        }

        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        // Optional: Add authorization check - only project_managers can create projects
        if ($user->role !== 'project_manager') {
            return response()->json(['message' => 'Unauthorized. Only project managers can create projects.'], 403);
        }

        $validated = $request->validate([
            'project_name'        => 'required|string|max:255',
            'project_code'        => 'required|string|max:255|unique:projects,project_code',
            'description'         => 'nullable|string',
            'start_date'          => 'required|date',
            'end_date'            => 'nullable|date|after_or_equal:start_date',
            'budget'              => 'nullable|numeric|min:0',
            'actual_expenditure'  => 'nullable|numeric|min:0',
            // 'user_id' is not expected from the request, it's set automatically
        ]);

        $validated['status'] = 'To Do'; // Default status
        $validated['user_id'] = $user->id; // Assign the creator as the project manager

        $project = Project::create($validated);
        $project->load('user:id,username'); // Load the user relationship for the response

        return response()->json($project, 201);
    }

    public function show($id) // $id is project_id
    {
        // Eager load the project manager
        $project = Project::with('user:id,username')->find($id);

        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        // Optional: Authorization check
        $user = Auth::user();
        if ($user->role === 'team_member' && !$project->tasks()->where('assigned_to', $user->id)->exists()) {
            // If team member, they can only see project details if assigned to a task in it.
            // Or if they are the PM (covered by user_id check if you add it)
            // This specific check might be too restrictive depending on your needs for project visibility.
            // For now, let's assume if they can hit the route, they can see it,
            // and rely on the `index` method to filter what they can list.
        }
        // A more robust check for general project access:
        // if ($user->role !== 'project_manager' || $project->user_id !== $user->id) {
        //    if (!$project->tasks()->where('assigned_to', $user->id)->exists()) {
        //        return response()->json(['message' => 'Unauthorized to view this project.'], 403);
        //    }
        // }


        return response()->json($project);
    }

    public function update(Request $request, $id) // $id is project_id
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $user = Auth::user();
        // Authorization: Only the assigned project manager can update the project
        if ($user->role !== 'project_manager' || $project->user_id !== $user->id) {
            // Add an exception for an 'admin' role if you have one
            // if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized to update this project.'], 403);
            // }
        }

        $validated = $request->validate([
            'project_name'        => 'sometimes|required|string|max:255',
            'project_code'        => 'sometimes|required|string|max:255|unique:projects,project_code,' . $project->id,
            'description'         => 'nullable|string',
            'start_date'          => 'sometimes|required|date',
            'end_date'            => 'nullable|date|after_or_equal:start_date',
            'status'              => 'sometimes|required|string', // Consider specific statuses: in:To Do,In Progress,Completed
            'budget'              => 'nullable|numeric|min:0',
            'actual_expenditure'  => 'nullable|numeric|min:0',
            // 'user_id' - Project manager reassignment could be a separate, more controlled action.
            // If you want to allow changing PM here, add it to validate and ensure the new user_id is a PM.
        ]);

        $project->update($validated);
        $project->load('user:id,username'); // Load the user relationship for the response

        return response()->json($project);
    }

    public function projectTotals($projectId)
    {
        // Add authorization: user should have access to this project
        $project = Project::with('tasks')->find($projectId);
        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $user = Auth::user();
        $canAccess = false;
        if ($user->role === 'project_manager' && $project->user_id === $user->id) {
            $canAccess = true;
        } elseif ($project->tasks()->where('assigned_to', $user->id)->exists()) {
            $canAccess = true;
        }

        if (!$canAccess) {
             return response()->json(['message' => 'Unauthorized to view totals for this project.'], 403);
        }


        try {
            // $project is already fetched and authorized
            $tasks = $project->tasks->map(function ($task) {
                $budget = $task->budget ?? 0;
                $amountUsed = $task->amount_used ?? 0; // Ensure this field exists or is calculated
                $leftover = $budget - $amountUsed;

                return [
                    'task_id'     => $task->id,
                    'title'       => $task->title,
                    'budget'      => $budget,
                    'amount_used' => $amountUsed,
                    'leftover'    => $leftover,
                ];
            });

            return response()->json(['tasks' => $tasks]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch project totals', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id) // $id is project_id
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $user = Auth::user();
        // Authorization: Only the assigned project manager can delete the project
        if ($user->role !== 'project_manager' || $project->user_id !== $user->id) {
            // Add an exception for an 'admin' role if you have one
            // if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized to delete this project.'], 403);
            // }
        }

        // Consider what happens to tasks, files, etc., when a project is deleted.
        // Eloquent onDelete('cascade') on foreign keys can handle this at DB level.
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }
}