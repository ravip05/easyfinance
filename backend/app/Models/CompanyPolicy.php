<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyPolicy extends Model
{
    use HasFactory;
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
