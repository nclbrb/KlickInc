<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    // Get projects (based on role)
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'team_member') {
            // Retrieve projects that have at least one task assigned to this team member
            $projects = Project::whereHas('tasks', function ($query) use ($user) {
                $query->where('assigned_to', $user->id);
            })->get();
        } else {
            // For project managers (and other roles), return all projects
            $projects = Project::all();
        }

        return response()->json($projects);
    }

    // Store a new project (including budget and actual expenditure)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_name'        => 'required|string|max:255',
            'project_code'        => 'required|string|max:255|unique:projects',
            'description'         => 'nullable|string',
            'start_date'          => 'required|date',
            'end_date'            => 'nullable|date',
            'budget'              => 'nullable|numeric|min:0',
            'actual_expenditure'  => 'nullable|numeric|min:0',
        ]);

        // Set default status to 'To Do' for new projects
        $validated['status'] = 'To Do';
        
        $project = Project::create($validated);

        return response()->json($project, 201);
    }

    // Show project details
    public function show($id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        return response()->json($project);
    }

    // Update an existing project
    public function update(Request $request, $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $validated = $request->validate([
            'project_name'        => 'required|string|max:255',
            'project_code'        => 'required|string|max:255|unique:projects,project_code,' . $project->id,
            'description'         => 'nullable|string',
            'start_date'          => 'required|date',
            'end_date'            => 'nullable|date',
            'status'              => 'required|string',
            'budget'              => 'nullable|numeric|min:0',
            'actual_expenditure'  => 'nullable|numeric|min:0',
        ]);

        $project->update($validated);

        return response()->json($project);
    }

    // Get totals for a project's tasks
    public function projectTotals($projectId)
    {
        try {
            $project = Project::with('tasks')->findOrFail($projectId);

            $tasks = $project->tasks->map(function ($task) {
                $budget = $task->budget ?? 0;
                $amountUsed = $task->amount_used ?? 0;
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

    // Delete a project
    public function destroy($id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }
}
