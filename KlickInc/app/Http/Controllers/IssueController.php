<?php

namespace App\Http\Controllers;

use App\Models\Issue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IssueController extends Controller
{
    public function index(Request $request)
    {
        $query = Issue::with(['project', 'reporter', 'task']);
        
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        $issues = $query->get();
        return response()->json($issues);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id'
        ]);

        $issue = Issue::create([
            'title' => $request->title,
            'description' => $request->description,
            'project_id' => $request->project_id,
            'task_id' => $request->task_id,
            'reported_by' => Auth::id(),
            'status' => 'open',
            'type' => $request->task_id ? 'task' : 'project'
        ]);

        return response()->json($issue->load(['project', 'reporter']), 201);
    }

    public function show(string $id)
    {
        $issue = Issue::with(['project', 'reporter', 'activities.user', 'task'])->findOrFail($id);
        return response()->json($issue);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:open,in_progress,resolved,closed',
            'amount' => 'sometimes|required|numeric|min:0',
        ]);

        $issue = Issue::findOrFail($id);
        $issue->update($request->all());

        return response()->json($issue->load(['project', 'reporter', 'activities.user']));
    }

    public function destroy(string $id)
    {
        $issue = Issue::findOrFail($id);
        $issue->delete();
        return response()->json(null, 204);
    }
} 