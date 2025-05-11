<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $with = ['comments'];

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
        return $this->belongsTo(User::class, 'assigned_to')
            ->select(['id', 'username as name']);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'task_id')
            ->with(['user' => function($query) {
                $query->select('id', 'username as name');
            }])
            ->latest();
    }
}
