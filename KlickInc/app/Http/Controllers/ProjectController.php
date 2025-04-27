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
        // Validate incoming request
        $request->validate([
            'project_name' => 'required|string|max:255',
            'project_code' => 'required|string|max:255|unique:projects',
            'description'  => 'nullable|string',
            'start_date'   => 'required|date',
            'end_date'     => 'nullable|date',
            'status'       => 'required|string',
            'budget'       => 'nullable|numeric|min:0', // New validation for budget
            'actual_expenditure' => 'nullable|numeric|min:0', // New validation for actual expenditure
        ]);

        // Create the project with the request data, including budget and actual_expenditure
        $project = Project::create($request->only(
            'project_name',
            'project_code',
            'description',
            'start_date',
            'end_date',
            'status',
            'budget',  // Store the budget
            'actual_expenditure' // Store the actual expenditure
        ));

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

    // Update an existing project (including budget and actual expenditure)
    public function update(Request $request, $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        // Validate the incoming request (including budget and actual expenditure)
        $request->validate([
            'project_name' => 'required|string|max:255',
            'project_code' => 'required|string|max:255|unique:projects,project_code,' . $project->id,
            'description'  => 'nullable|string',
            'start_date'   => 'required|date',
            'end_date'     => 'nullable|date',
            'status'       => 'required|string',
            'budget'       => 'nullable|numeric|min:0', // New validation for budget
            'actual_expenditure' => 'nullable|numeric|min:0', // New validation for actual expenditure
        ]);

        // Update the project with the new data (including budget and actual_expenditure)
        $project->update($request->only(
            'project_name',
            'project_code',
            'description',
            'start_date',
            'end_date',
            'status',
            'budget',  // Update the budget
            'actual_expenditure' // Update the actual expenditure
        ));

        return response()->json($project);
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
