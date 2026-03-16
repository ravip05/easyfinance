<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Lead;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadStageTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $staff;
    protected $otherStaff;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->staff = User::factory()->create(['role' => 'staff']);
        $this->otherStaff = User::factory()->create(['role' => 'staff']);
    }

    public function test_staff_can_update_own_lead_stage()
    {
        $lead = Lead::factory()->create([
            'assigned_to' => $this->staff->id,
            'stage' => 'New'
        ]);

        $response = $this->actingAs($this->staff)->patchJson("/api/leads/{$lead->id}/stage", [
            'stage' => 'Contacted'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.stage', 'Contacted');

        $this->assertEquals('Contacted', $lead->fresh()->stage);
    }

    public function test_staff_cannot_update_others_lead_stage()
    {
        $lead = Lead::factory()->create([
            'assigned_to' => $this->otherStaff->id,
            'stage' => 'New'
        ]);

        $response = $this->actingAs($this->staff)->patchJson("/api/leads/{$lead->id}/stage", [
            'stage' => 'Contacted'
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_any_lead_stage()
    {
        $lead = Lead::factory()->create([
            'assigned_to' => $this->staff->id,
            'stage' => 'New'
        ]);

        $response = $this->actingAs($this->admin)->patchJson("/api/leads/{$lead->id}/stage", [
            'stage' => 'Processing'
        ]);

        $response->assertStatus(200);
        $this->assertEquals('Processing', $lead->fresh()->stage);
    }

    public function test_invalid_stage_is_rejected()
    {
        $lead = Lead::factory()->create(['assigned_to' => $this->staff->id]);

        $response = $this->actingAs($this->staff)->patchJson("/api/leads/{$lead->id}/stage", [
            'stage' => 'INVALID_STAGE_NAME'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['stage']);
    }
}
