<?php

namespace Database\Factories;

use App\Models\CompanyPolicy;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyPolicyFactory extends Factory
{
    protected $model = CompanyPolicy::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence,
            'category' => $this->faker->randomElement(['HR', 'IT', 'Operations', 'Finance']),
            'content' => $this->faker->paragraphs(3, true),
            'version' => '1.0',
            'is_active' => true,
        ];
    }
}
