<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{

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

    public function store(Request $request)
    {
        $request->validate([
            'project_name' => 'required|string|max:255',
            'project_code' => 'required|string|max:255|unique:projects',
            'description'  => 'nullable|string',
            'start_date'   => 'required|date',
            'end_date'     => 'nullable|date',
            'status'       => 'required|string',
        ]);

        $project = Project::create($request->only(
            'project_name',
            'project_code',
            'description',
            'start_date',
            'end_date',
            'status'
        ));

        return response()->json($project, 201);
    }

    public function show($id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        return response()->json($project);
    }

    public function update(Request $request, $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $request->validate([
            'project_name' => 'required|string|max:255',
            'project_code' => 'required|string|max:255|unique:projects,project_code,' . $project->id,
            'description'  => 'nullable|string',
            'start_date'   => 'required|date',
            'end_date'     => 'nullable|date',
            'status'       => 'required|string',
        ]);

        $project->update($request->only(
            'project_name',
            'project_code',
            'description',
            'start_date',
            'end_date',
            'status'
        ));

        return response()->json($project);
    }

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
