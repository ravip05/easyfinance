<?php

namespace Database\Factories;

use App\Models\Holiday;
use Illuminate\Database\Eloquent\Factories\Factory;

class HolidayFactory extends Factory
{
    protected $model = Holiday::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->words(2, true),
            'date' => $this->faker->dateTimeBetween('now', '+1 year')->format('Y-m-d'),
            'type' => $this->faker->randomElement(['national', 'regional', 'company']),
            'is_optional' => $this->faker->boolean,
        ];
    }
}
