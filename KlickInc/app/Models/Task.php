<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\File; // Assuming File model exists and is used

class Task extends Model
{
    use HasFactory;

    // Using $guarded = [] means all attributes are mass assignable.
    // If you switch to $fillable, ensure all intended attributes are listed.
    protected $guarded = [];

    // Eager load comments by default.
    // Note: Eager loading 'user' here directly might be too broad if not always needed.
    // It's often better to eager load relationships when querying, like in TaskController.
    protected $with = ['comments'];

    // $fillable is still good practice even with $guarded = [] for clarity
    // and if you ever switch from $guarded.
    protected $fillable = [
        'title',
        'description',
        'assigned_to', // Foreign key for the user relationship
        'project_id',  // Foreign key for the project relationship
        'status',
        'priority',
        'deadline',
        'budget',
        'actual_expenditure', // Assuming this is a field
        'amount_used',
        'start_time',
        'end_time',
        'time_spent',
    ];

    /**
     * Get the project that the task belongs to.
     */
    public function project()
    {
        // Eager loading the project's manager ('user') here is fine if frequently needed with the project.
        return $this->belongsTo(Project::class)->with('user');
    }

    /**
     * Get the user to whom the task is assigned.
     */
    public function user() // This is the 'assigned_to' user
    {
        return $this->belongsTo(User::class, 'assigned_to')
            // Select 'id' and 'username'.
            // The 'name' attribute will be available via the User model's getNameAttribute() accessor.
            ->select(['id', 'username']); // <-- MODIFIED HERE
    }

    /**
     * Get all of the comments for the task.
     */
    public function comments()
    {
        return $this->hasMany(Comment::class, 'task_id')
            ->with(['user' => function($query) {
                // Select 'id' and 'username' for the comment's user.
                // The 'name' attribute will be available via the User model's getNameAttribute() accessor.
                $query->select('id', 'username'); // <-- MODIFIED HERE
            }])
            ->latest();
    }

    /**
     * Get all of the task's files.
     */
    public function files()
    {
        return $this->morphMany(File::class, 'fileable');
    }
}