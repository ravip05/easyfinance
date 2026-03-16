<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Lead;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $manager;
    protected $staff;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin', 'status' => 'Active']);
        $this->manager = User::factory()->create(['role' => 'manager', 'status' => 'Active']);
        $this->staff = User::factory()->create(['role' => 'staff', 'status' => 'Active', 'team_leader_id' => $this->manager->id]);
    }

    public function test_admin_can_list_all_leads()
    {
        Lead::factory()->count(5)->create();
        $response = $this->actingAs($this->admin)->getJson('/api/leads');
        $response->assertStatus(200)->assertJsonCount(5, 'data');
    }

    public function test_staff_can_only_see_own_leads()
    {
        Lead::factory()->create(['assigned_to' => $this->staff->id]);
        Lead::factory()->create(['assigned_to' => $this->admin->id]);

        $response = $this->actingAs($this->staff)->getJson('/api/leads');
        $response->assertStatus(200)->assertJsonCount(1, 'data');
    }

    public function test_admin_can_create_lead()
    {
        $data = [
            'name' => 'John New Lead',
            'phone' => '1234567890',
            'loan_type' => 'Home Loan',
            'amount' => 5000000,
            'source' => 'Direct',
            'priority' => 'High'
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/leads', $data);
        $response->assertStatus(201);
        $this->assertDatabaseHas('leads', ['name' => 'John New Lead']);
    }

    public function test_admin_can_update_lead()
    {
        $lead = Lead::factory()->create();
        $response = $this->actingAs($this->admin)->putJson("/api/leads/{$lead->id}", [
            'name' => 'Updated Name',
            'stage' => 'Contacted'
        ]);

        $response->assertStatus(200);
        $this->assertEquals('Updated Name', $lead->fresh()->name);
    }

    public function test_admin_can_delete_lead()
    {
        $lead = Lead::factory()->create();
        $response = $this->actingAs($this->admin)->deleteJson("/api/leads/{$lead->id}");
        $response->assertStatus(200);
        $this->assertSoftDeleted('leads', ['id' => $lead->id]);
    }
}
