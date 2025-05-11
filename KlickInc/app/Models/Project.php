<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Task;
use App\Models\User;

class Project extends Model
{
    use HasFactory;

    // Add 'budget' and 'actual_expenditure' to the $fillable array
    protected $fillable = [
        'project_name',
        'project_code',
        'description',
        'start_date',
        'end_date',
        'status',
        'budget',  // New field for budget
        'actual_expenditure',  // New field for actual expenditure
    ];

    // Optionally, cast 'budget' and 'actual_expenditure' to decimal
    protected $casts = [
        'budget' => 'decimal:2',  // Store with two decimal points (modify if needed)
        'actual_expenditure' => 'decimal:2',  // Store with two decimal points (modify if needed)
    ];

    // Define relationship with User model (1-to-many)
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Define relationship with Task model (1-to-many)
    public function tasks()
    {
        return $this->hasMany(Task::class, 'project_id', 'id');
    }

    // Additional helper method to calculate remaining budget
    public function remainingBudget()
    {
        // Ensure budget and actual_expenditure are numbers, avoid null or negative values
        return max(0, $this->budget - $this->actual_expenditure);
    }
}
