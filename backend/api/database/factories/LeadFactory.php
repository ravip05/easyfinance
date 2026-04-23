<?php

namespace Database\Factories;

use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lead>
 */
class LeadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'phone' => '9' . fake()->numerify('#########'),
            'email' => fake()->unique()->safeEmail(),
            'amount' => fake()->numberBetween(100000, 5000000),
            'loan_type' => fake()->randomElement(['Home Loan', 'Personal Loan', 'Business Loan']),
            'stage' => fake()->randomElement(['New', 'Contacted', 'Processing']),
            'priority' => fake()->randomElement(['High', 'Medium', 'Low']),
            'source' => 'Direct',
            'assigned_to' => null,
            'added_by' => null,
        ];
    }
}
