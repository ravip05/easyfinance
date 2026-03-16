<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Ticket;
use App\Models\TicketReply;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketInteractionTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $staff;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->staff = User::factory()->create(['role' => 'staff']);
    }

    public function test_staff_can_create_ticket()
    {
        $response = $this->actingAs($this->staff)->postJson('/api/tickets', [
            'subject' => 'Issue with login',
            'description' => 'I cannot login to the mobile app',
            'priority' => 'High',
            'category' => 'Technical'
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'Open');
            
        $this->assertDatabaseHas('tickets', ['subject' => 'Issue with login', 'user_id' => $this->staff->id]);
    }

    public function test_admin_can_reply_to_ticket_and_status_changes_to_in_progress()
    {
        $ticket = Ticket::create([
            'user_id' => $this->staff->id,
            'subject' => 'Help needed',
            'description' => 'Please help',
            'priority' => 'Medium',
            'category' => 'General',
            'status' => 'Open'
        ]);

        $response = $this->actingAs($this->admin)->postJson("/api/tickets/{$ticket->id}/reply", [
            'message' => 'I am looking into it.'
        ]);

        $response->assertStatus(201);
        $this->assertEquals('In Progress', $ticket->fresh()->status);
        $this->assertDatabaseHas('ticket_replies', ['message' => 'I am looking into it.', 'user_id' => $this->admin->id]);
    }

    public function test_staff_can_only_see_own_tickets()
    {
        $ticket1 = Ticket::create([
            'user_id' => $this->staff->id,
            'subject' => 'My Ticket',
            'description' => '...',
            'priority' => 'Low',
            'category' => 'General',
            'status' => 'Open'
        ]);

        $otherStaff = User::factory()->create(['role' => 'staff']);
        $ticket2 = Ticket::create([
            'user_id' => $otherStaff->id,
            'subject' => 'Other Ticket',
            'description' => '...',
            'priority' => 'Low',
            'category' => 'General',
            'status' => 'Open'
        ]);

        $response = $this->actingAs($this->staff)->getJson('/api/tickets');

        $response->assertStatus(200);
        // Check that only 1 ticket is returned in the paginated data array
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('My Ticket', $response->json('data.0.subject'));
    }

    public function test_admin_can_change_ticket_status()
    {
        $ticket = Ticket::create([
            'user_id' => $this->staff->id,
            'subject' => 'Close me',
            'description' => '...',
            'priority' => 'Low',
            'category' => 'General',
            'status' => 'Open'
        ]);

        $response = $this->actingAs($this->admin)->putJson("/api/tickets/{$ticket->id}", [
            'status' => 'Resolved'
        ]);

        $response->assertStatus(200);
        $this->assertEquals('Resolved', $ticket->fresh()->status);
    }
}
