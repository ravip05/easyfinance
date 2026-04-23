<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Lead;
use App\Models\User;
use App\Models\Franchise;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClientFactory extends Factory
{
    protected $model = Client::class;

    public function definition(): array
    {
        return [
            'lead_id' => Lead::factory(),
            'name' => $this->faker->name,
            'phone' => $this->faker->phoneNumber,
            'email' => $this->faker->safeEmail,
            'pan_number' => strtoupper($this->faker->bothify('?????####?')),
            'aadhaar_number' => $this->faker->numerify('############'),
            'loan_type' => $this->faker->randomElement(['Home Loan', 'Personal Loan', 'Business Loan']),
            'amount' => $this->faker->numberBetween(100000, 5000000),
            'monthly_income' => $this->faker->numberBetween(30000, 200000),
            'emi_amount' => $this->faker->numberBetween(5000, 50000),
            'tenure_months' => $this->faker->randomElement([12, 24, 36, 48, 60]),
            'disbursed_at' => null,
            'cibil_score' => $this->faker->numberBetween(300, 900),
            'stage' => 'New',
            'managed_by' => User::factory(),
            'franchise_id' => Franchise::factory(),
        ];
    }
}
