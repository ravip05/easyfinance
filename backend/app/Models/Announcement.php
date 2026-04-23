<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Announcement extends Model
{
    use HasFactory;

    // ── Mass Assignment ───────────────────────────────────────────────────────
    protected $fillable = [
        'title',
        'message',
        'target',
        'priority',
        'channel_app',
        'channel_sms',
        'channel_email',
        'channel_whatsapp',
        'scheduled_at',
        'published_at',
        'created_by',
    ];

    // ── Casts ─────────────────────────────────────────────────────────────────
    protected function casts(): array
    {
        return [
            'channel_app'       => 'boolean',
            'channel_sms'       => 'boolean',
            'channel_email'     => 'boolean',
            'channel_whatsapp'  => 'boolean',
            'scheduled_at'      => 'datetime',
            'published_at'      => 'datetime',
        ];
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Returns channels as an array of active channel names.
     * Mirrors the prototype's channels:['app','sms'] format for the API response.
     * ['app', 'email'] etc.
     */
    public function getChannelsAttribute(): array
    {
        $channels = [];

        if ($this->channel_app)       $channels[] = 'app';
        if ($this->channel_sms)       $channels[] = 'sms';
        if ($this->channel_email)     $channels[] = 'email';
        if ($this->channel_whatsapp)  $channels[] = 'whatsapp';

        return $channels;
    }

    /**
     * Whether this announcement has been published (sent to users).
     */
    public function getIsPublishedAttribute(): bool
    {
        return $this->published_at !== null;
    }

    /**
     * Whether this announcement is scheduled for future delivery.
     */
    public function getIsScheduledAttribute(): bool
    {
        return $this->scheduled_at !== null && $this->published_at === null;
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    /**
     * Only published announcements (visible to users).
     */
    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at');
    }

    /**
     * Announcements visible to a specific role.
     * Mirrors the prototype's target filtering logic.
     */
    public function scopeForRole($query, string $role)
    {
        $targets = ['all']; // 'all' always included

        $targets[] = match ($role) {
            'manager'  => 'manager',
            'staff'    => 'staff',
            'dsa'      => 'dsa',
            'admin'    => 'manager', // admins see manager-targeted ones too
            default    => null,
        };

        if ($role === 'dsa') {
            $targets[] = 'franchise_all';
        }

        return $query->whereIn('target', array_filter($targets));
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * The admin/manager who composed this announcement.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Users who have read this announcement (via pivot).
     */
    public function readers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'announcement_reads')
                    ->withPivot('read_at')
                    ->withTimestamps();
    }

    /**
     * Raw read receipt rows (for counting / checking specific user).
     */
    public function readReceipts(): HasMany
    {
        return $this->hasMany(AnnouncementRead::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Returns true if the given user has read this announcement.
     */
    public function isReadBy(User $user): bool
    {
        return $this->readReceipts()
                    ->where('user_id', $user->id)
                    ->exists();
    }

    /**
     * Mark as read by the given user (idempotent).
     */
    public function markReadBy(User $user): void
    {
        $this->readReceipts()->firstOrCreate(
            ['user_id' => $user->id],
            ['read_at' => now()]
        );
    }
}
