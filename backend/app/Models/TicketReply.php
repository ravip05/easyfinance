<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TicketReply extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_id',
        'user_id',
        'parent_id',
        'message',
        'attachments',
        'is_internal_note',
    ];

    protected $casts = [
        'attachments'      => 'array',
        'is_internal_note' => 'boolean',
    ];

    // the ticket this reply belongs to
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    // the user who wrote this reply
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // parent reply for threaded conversations
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    // child replies nested under this one
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('created_at');
    }

    // recursive eager loading for unlimited nesting depth
    public function childrenRecursive(): HasMany
    {
        return $this->children()->with('childrenRecursive', 'user:id,name,role');
    }
}
