<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyPolicy extends Model
{
    protected $table = 'company_policies';

    protected $fillable = [
        'title',
        'category',
        'content',
        'version',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
