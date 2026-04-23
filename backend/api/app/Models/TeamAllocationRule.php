<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamAllocationRule extends Model
{
    protected $fillable = [
        'name', 'manager_id', 'department', 'role_target',
        'max_capacity', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active'    => 'boolean',
            'max_capacity' => 'integer',
        ];
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Find the best manager to auto-assign a new user to,
     * based on department matching and remaining capacity.
     */
    public static function findBestManager(?string $department = null, string $roleTarget = 'staff'): ?User
    {
        $rules = static::where('is_active', true)
            ->where('role_target', $roleTarget)
            ->when($department, fn ($q, $d) => $q->where(function ($qq) use ($d) {
                $qq->where('department', $d)->orWhereNull('department');
            }))
            ->with('manager')
            ->get();

        foreach ($rules as $rule) {
            $currentCount = User::where('team_leader_id', $rule->manager_id)
                ->where('status', 'Active')
                ->count();

            if ($currentCount < $rule->max_capacity) {
                return $rule->manager;
            }
        }

        return null;
    }
}
