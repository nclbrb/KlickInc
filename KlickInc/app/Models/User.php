<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;
use App\Models\Notification;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    
    protected $table = 'klick_users';
    
    protected $fillable = [
        'username', 
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get all notifications for the user
     */
    public function notifications()
    {
        Log::debug('User::notifications() called', [
            'user_id' => $this->id,
            'user_role' => $this->role,
            'model_class' => get_class($this)
        ]);
        
        // This ensures we're using the full namespaced class name for the polymorphic relationship
        return $this->morphMany(\App\Models\Notification::class, 'notifiable')
            ->orderBy('created_at', 'desc');
    }

    /**
     * Get all unread notifications for the user
     */
    public function unreadNotifications()
    {
        return $this->notifications()->whereNull('read_at');
    }

    /**
     * Get the user's full name.
     */
    public function getNameAttribute()
    {
        return $this->username;
    }
}
