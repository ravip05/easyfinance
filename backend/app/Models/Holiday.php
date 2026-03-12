<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = [
        'title',
        'date',
        'type',
        'is_optional',
    ];

    protected $casts = [
        'date' => 'date',
        'is_optional' => 'boolean',
    ];
}
