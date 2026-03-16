<?php

namespace Database\Factories;

use App\Models\Franchise;
use Illuminate\Database\Eloquent\Factories\Factory;

class FranchiseFactory extends Factory
{
    protected $model = Franchise::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company . ' EasyFinance',
            'code' => strtoupper($this->faker->bothify('EF-????')),
            'owner_name' => $this->faker->name,
            'city' => $this->faker->city,
            'commission_rate' => 0.003,
            'status' => 'Active',
            'phone' => $this->faker->phoneNumber,
            'email' => $this->faker->companyEmail,
            'address' => $this->faker->address,
        ];
    }
}
