<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use App\Models\Franchise;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_all_clients()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Client::factory()->count(5)->create();

        $response = $this->actingAs($admin)->getJson('/api/clients');

        $response->assertStatus(200)
                 ->assertJsonCount(5, 'data');
    }

    public function test_staff_can_only_see_own_clients()
    {
        $staff1 = User::factory()->create(['role' => 'staff']);
        $staff2 = User::factory()->create(['role' => 'staff']);

        Client::factory()->count(3)->create(['managed_by' => $staff1->id]);
        Client::factory()->count(2)->create(['managed_by' => $staff2->id]);

        $response = $this->actingAs($staff1)->getJson('/api/clients');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }

    public function test_dsa_can_only_see_franchise_clients()
    {
        $franchise1 = Franchise::factory()->create();
        $franchise2 = Franchise::factory()->create();

        $dsa = User::factory()->create([
            'role' => 'dsa',
            'franchise_id' => $franchise1->id
        ]);

        Client::factory()->count(4)->create(['franchise_id' => $franchise1->id]);
        Client::factory()->count(2)->create(['franchise_id' => $franchise2->id]);

        $response = $this->actingAs($dsa)->getJson('/api/clients');

        $response->assertStatus(200)
                 ->assertJsonCount(4, 'data');
    }

    public function test_can_create_client()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $clientData = [
            'name' => 'John Doe',
            'phone' => '1234567890',
            'email' => 'john@example.com',
            'loan_type' => 'Home Loan',
            'amount' => 500000,
            'stage' => 'New'
        ];

        $response = $this->actingAs($admin)->postJson('/api/clients', $clientData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('clients', ['email' => 'john@example.com']);
    }
}
