<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Client;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientCRUDTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    public function test_admin_can_list_clients()
    {
        Client::factory()->count(2)->create();
        
        $response = $this->actingAs($this->admin)->getJson('/api/clients');
        
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_create_client()
    {
        $data = [
            'name' => 'John Client',
            'email' => 'john@client.com',
            'phone' => '1212121212',
            'address' => '123 Client St',
            'pan' => 'ABCDE1234F',
            'loan_type' => 'Home Loan',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/clients', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('clients', ['name' => 'John Client']);
    }

    public function test_admin_can_update_client()
    {
        $client = Client::factory()->create();

        $response = $this->actingAs($this->admin)->putJson("/api/clients/{$client->id}", [
            'name' => 'Updated Client',
            'loan_type' => 'Home Loan',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('Updated Client', $client->fresh()->name);
    }

    public function test_admin_can_delete_client()
    {
        $client = Client::factory()->create();

        $response = $this->actingAs($this->admin)->deleteJson("/api/clients/{$client->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('clients', ['id' => $client->id]);
    }
}
