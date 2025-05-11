<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Notification extends Model
{
    protected $fillable = [
        'message',
        'type',
        'notifiable_type',
        'notifiable_id',
        'read_at'
    ];

    protected $dates = ['read_at', 'created_at', 'updated_at'];
    
    protected $appends = ['is_read'];
    
    protected $with = ['notifiable'];

    /**
     * Get the user that the notification is for.
     */
    public function user()
    {
        return $this->notifiable;
    }

    /**
     * Get the notifiable entity that the notification belongs to.
     */
    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }
    
    /**
     * Determine if the notification has been read.
     */
    public function getIsReadAttribute(): bool
    {
        return $this->read_at !== null;
    }
    
    /**
     * Mark the notification as read.
     */
    public function markAsRead(): bool
    {
        if (is_null($this->read_at)) {
            return $this->forceFill(['read_at' => $this->freshTimestamp()])->save();
        }
        
        return false;
    }
}
