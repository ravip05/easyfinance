<?php

namespace Tests\Feature;

use App\Models\Holiday;
use App\Models\CompanyPolicy;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HRTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_holidays()
    {
        $user = User::factory()->create();
        Holiday::factory()->count(3)->create();

        $response = $this->actingAs($user)->getJson('/api/holidays');

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');
    }

    public function test_user_can_list_active_policies()
    {
        $user = User::factory()->create();
        CompanyPolicy::factory()->count(2)->create(['is_active' => true]);
        CompanyPolicy::factory()->create(['is_active' => false]);

        $response = $this->actingAs($user)->getJson('/api/company-policies');

        $response->assertStatus(200);
        // Assuming the API only returns active policies by default
        $response->assertJsonCount(2, 'data');
    }

    public function test_admin_can_create_holiday()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $holidayData = [
            'title' => 'New Year',
            'date' => '2026-01-01',
            'type' => 'national',
            'is_optional' => false
        ];

        $response = $this->actingAs($admin)->postJson('/api/holidays', $holidayData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('holidays', ['title' => 'New Year']);
    }
}
