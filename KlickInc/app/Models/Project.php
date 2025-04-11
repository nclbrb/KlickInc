<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Task;

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
    ];


    public function tasks()
    {
        return $this->hasMany(Task::class, 'project_id', 'id');
    }
}
