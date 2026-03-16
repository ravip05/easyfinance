<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Lead;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_all_leads(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Lead::factory()->count(5)->create();

        $response = $this->actingAs($admin)
                         ->getJson('/api/leads');

        $response->assertStatus(200)
                 ->assertJsonCount(5, 'data');
    }

    public function test_staff_can_only_see_assigned_leads(): void
    {
        $staff1 = User::factory()->create(['role' => 'staff']);
        $staff2 = User::factory()->create(['role' => 'staff']);
        
        Lead::factory()->count(3)->create(['assigned_to' => $staff1->id]);
        Lead::factory()->count(2)->create(['assigned_to' => $staff2->id]);

        $response = $this->actingAs($staff1)
                         ->getJson('/api/leads');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }

    public function test_can_create_lead(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        
        $payload = [
            'name' => 'Test Lead',
            'phone' => '1234567890',
            'email' => 'test@example.com',
            'amount' => 500000,
            'loan_type' => 'Home Loan',
            'priority' => 'High',
            'stage' => 'New'
        ];

        $response = $this->actingAs($staff)
                         ->postJson('/api/leads', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('leads', ['name' => 'Test Lead']);
    }
}
