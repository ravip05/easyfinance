<?php

namespace Database\Factories;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence,
            'message' => $this->faker->paragraph,
            'target' => $this->faker->randomElement(['all', 'staff', 'manager', 'dsa', 'franchise_all']),
            'priority' => $this->faker->randomElement(['normal', 'important', 'urgent']),
            'channel_app' => true,
            'channel_sms' => false,
            'channel_email' => false,
            'channel_whatsapp' => false,
            'published_at' => now(),
            'created_by' => User::factory(),
        ];
    }
}
