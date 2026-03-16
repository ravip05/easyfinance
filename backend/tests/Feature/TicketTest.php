<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\TicketReply;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_ticket()
    {
        $user = User::factory()->create(['role' => 'client']);
        $ticketData = [
            'subject' => 'Service Issue',
            'description' => 'Cannot access my documents',
            'priority' => 'High',
            'category' => 'Technical'
        ];

        $response = $this->actingAs($user)->postJson('/api/tickets', $ticketData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tickets', [
            'subject' => 'Service Issue',
            'user_id' => $user->id
        ]);
    }

    public function test_staff_can_reply_to_ticket()
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $ticket = Ticket::factory()->create();

        $replyData = [
            'message' => 'We are looking into it.'
        ];

        $response = $this->actingAs($staff)->postJson("/api/tickets/{$ticket->id}/reply", $replyData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('ticket_replies', [
            'ticket_id' => $ticket->id,
            'user_id' => $staff->id,
            'message' => 'We are looking into it.'
        ]);
    }

    public function test_client_cannot_see_others_tickets()
    {
        $client1 = User::factory()->create(['role' => 'client']);
        $client2 = User::factory()->create(['role' => 'client']);
        
        Ticket::factory()->create(['user_id' => $client1->id]);
        Ticket::factory()->create(['user_id' => $client2->id]);

        $response = $this->actingAs($client1)->getJson('/api/tickets');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
    }
}
