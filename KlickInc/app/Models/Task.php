<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    // Add 'start_time' to the fillable array
    protected $fillable = [
        'title',
        'description',
        'assigned_to',
        'project_id',
        'status',
        'priority',
        'deadline',
        'budget',
        'actual_expenditure',
        'amount_used',
        'start_time',
        'end_time', 
        'time_spent',
    ];
    

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
