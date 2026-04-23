<?php

namespace Database\Factories;

use App\Models\TicketReply;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TicketReplyFactory extends Factory
{
    protected $model = TicketReply::class;

    public function definition(): array
    {
        return [
            'ticket_id' => Ticket::factory(),
            'user_id' => User::factory(),
            'message' => $this->faker->paragraph,
            'attachments' => null,
        ];
    }
}
