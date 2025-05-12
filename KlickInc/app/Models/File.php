<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'fileable_id',
        'fileable_type',
        'original_filename',
        'stored_filename',
        'mime_type',
        'size',
        'disk',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    /**
     * Get the user who uploaded the file.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the parent fileable model (task, project, comment, etc.).
     */
    public function fileable(): MorphTo
    {
        return $this->morphTo();
    }
}