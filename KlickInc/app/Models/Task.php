<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    // Add 'deadline' to the fillable array
    protected $fillable = [
        'title',
        'description',
        'assigned_to',
        'project_id',
        'status',
        'priority',
        'deadline', // Add this line
    ];

    // Define relationships
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
