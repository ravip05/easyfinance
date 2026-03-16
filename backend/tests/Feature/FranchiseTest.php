<?php

namespace Tests\Feature;

use App\Models\Franchise;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FranchiseTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_franchises()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Franchise::factory()->count(3)->create();

        $response = $this->actingAs($admin)->getJson('/api/franchises');

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');
    }

    public function test_admin_can_create_franchise()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $franchiseData = [
            'name' => 'Test Franchise',
            'code' => 'EFW-TMS01',
            'owner_name' => 'Owner Name',
            'city' => 'Test City',
            'email' => 'franchise@test.com',
            'commission_rate' => 0.03,
            'status' => 'Active'
        ];

        $response = $this->actingAs($admin)->postJson('/api/franchises', $franchiseData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('franchises', ['code' => 'EFW-TMS01']);
    }

    public function test_dsa_cannot_see_other_franchises()
    {
        $franchise = Franchise::factory()->create();
        $dsa = User::factory()->create([
            'role' => 'dsa',
            'franchise_id' => $franchise->id
        ]);

        $response = $this->actingAs($dsa)->getJson('/api/franchises');

        // Usually dsa can't see list of franchises
        $response->assertStatus(403);
    }
}
