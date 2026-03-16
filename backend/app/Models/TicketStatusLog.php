<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// immutable audit log for ticket status transitions
// never update or delete rows in this table

class TicketStatusLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'ticket_id',
        'changed_by',
        'from_status',
        'to_status',
        'trigger',
        'reason',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function changedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
