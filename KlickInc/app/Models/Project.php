<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Task;
use App\Models\User;
use App\Models\File; // Keep this if you plan project-level files directly

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_name',
        'project_code',
        'description',
        'start_date',
        'end_date',
        'status',
        'budget',
        'actual_expenditure',
        'user_id', // <-- ADD THIS LINE
    ];

    protected $casts = [
        'budget' => 'decimal:2',
        'actual_expenditure' => 'decimal:2',
        'start_date' => 'date', // Good practice to cast dates
        'end_date' => 'date',   // Good practice to cast dates
    ];

    /**
     * Get the project manager for the project.
     */
    public function user() // Renamed from manager() to user() to match foreign key 'user_id'
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the tasks for the project.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class, 'project_id', 'id');
    }

    /**
     * Get all of the project's files (if attaching files directly to projects).
     * If files are only through tasks, this might not be needed here.
     */
    public function files()
    {
        return $this->morphMany(File::class, 'fileable');
    }

    public function remainingBudget()
    {
        return max(0, $this->budget - $this->actual_expenditure);
    }
}