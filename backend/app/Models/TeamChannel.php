<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamChannel extends Model
{
    protected $fillable = ['name', 'label', 'icon', 'description', 'is_default', 'created_by'];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function messages(): HasMany
    {
        return $this->hasMany(TeamMessage::class, 'channel_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
