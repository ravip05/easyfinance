<?php

namespace Database\Factories;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'assigned_to' => null,
            'subject' => $this->faker->sentence,
            'description' => $this->faker->paragraph,
            'priority' => $this->faker->randomElement(['normal', 'important', 'urgent']),
            'status' => 'Open',
            'category' => $this->faker->randomElement(['Technical', 'Billing', 'Loan', 'Other']),
        ];
    }
}
