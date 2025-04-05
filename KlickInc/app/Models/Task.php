<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Project;
use App\Models\User;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'assigned_to',
        'title',
        'description',
        'status',
        'priority',
    ];

    /**
     * Relationship: Each task belongs to a project.
     */
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id', 'id');
    }

    /**
     * Relationship: Each task is assigned to a user (team member).
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'assigned_to', 'id');
    }
}
