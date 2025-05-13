<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class Issue extends Model
{
    protected $fillable = [
        'title',
        'description',
        'project_id',
        'task_id',
        'reported_by',
        'status',
        'type',
        'amount'
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function activities()
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    protected static function booted()
    {
        static::updating(function ($issue) {
            if ($issue->isDirty('amount')) {
                $issue->recordActivity('amount_updated', [
                    'old_amount' => $issue->getOriginal('amount'),
                    'new_amount' => $issue->amount
                ]);
            }
        });
    }

    public function recordActivity($type, $changes = null)
    {
        $this->activities()->create([
            'user_id' => Auth::id(),
            'type' => $type,
            'changes' => $changes
        ]);
    }
} 