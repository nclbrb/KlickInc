<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\File;

class Comment extends Model
{
    protected $fillable = [
        'comment',
        'task_id',
        'user_id'
    ];

    protected $with = ['user'];

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    protected $table = 'comments';
    
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id')
            ->select(['id', 'username as name']);
    }
    public function files()
{
    return $this->morphMany(File::class, 'fileable');
}
}
