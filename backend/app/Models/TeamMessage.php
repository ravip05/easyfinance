<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeamMessage extends Model
{
    protected $fillable = ['channel_id', 'user_id', 'message', 'reply_to_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function channel(): BelongsTo
    {
        return $this->belongsTo(TeamChannel::class, 'channel_id');
    }

    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(TeamMessage::class, 'reply_to_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(TeamMessage::class, 'reply_to_id');
    }
}
