<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Franchise;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FranchiseCRUDTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin', 'status' => 'Active']);
    }

    public function test_admin_can_list_franchises()
    {
        Franchise::factory()->count(2)->create();
        
        $response = $this->actingAs($this->admin)->getJson('/api/franchises');
        
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_create_franchise()
    {
        $data = [
            'name' => 'Mega Franchise',
            'code' => 'EFW-MEG01',
            'owner_name' => 'John Owner',
            'city' => 'Anytown',
            'commission_rate' => 0.05,
            'status' => 'Active',
            'phone' => '9999999999',
            'email' => 'mega@example.com',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/franchises', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('franchises', ['name' => 'Mega Franchise', 'code' => 'EFW-MEG01']);
    }

    public function test_admin_can_update_franchise()
    {
        $franchise = Franchise::factory()->create(['code' => 'EFW-OLD01']);

        $response = $this->actingAs($this->admin)->putJson("/api/franchises/{$franchise->id}", [
            'name' => 'Updated Franchise',
            'commission_rate' => 0.04,
        ]);

        $response->assertStatus(200);
        $this->assertEquals('Updated Franchise', $franchise->fresh()->name);
        $this->assertEquals(0.04, (float)$franchise->fresh()->commission_rate);
    }

    public function test_admin_can_delete_franchise()
    {
        $franchise = Franchise::factory()->create(['status' => 'Active']);

        // Soft deactivation sets status to Inactive
        $response = $this->actingAs($this->admin)->deleteJson("/api/franchises/{$franchise->id}");

        $response->assertStatus(200);
        $this->assertEquals('Inactive', $franchise->fresh()->status);
    }
}
