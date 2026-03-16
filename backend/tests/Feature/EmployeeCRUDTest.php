<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeCRUDTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    public function test_admin_can_list_employees()
    {
        User::factory()->count(3)->create(['role' => 'staff']);
        
        $response = $this->actingAs($this->admin)->getJson('/api/employees');
        
        $response->assertStatus(200)
            ->assertJsonCount(4, 'data'); // 3 + admin
    }

    public function test_admin_can_create_employee()
    {
        $data = [
            'name' => 'New Employee',
            'email' => 'new@example.com',
            'password' => 'password123',
            'role' => 'staff',
            'phone' => '1234567890',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/employees', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
    }

    public function test_admin_can_update_employee()
    {
        $employee = User::factory()->create(['role' => 'staff']);

        $response = $this->actingAs($this->admin)->putJson("/api/employees/{$employee->id}", [
            'name' => 'Updated Name',
            'email' => $employee->email,
            'role' => 'staff',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('Updated Name', $employee->fresh()->name);
    }

    public function test_admin_can_delete_employee()
    {
        $employee = User::factory()->create(['role' => 'staff']);

        $response = $this->actingAs($this->admin)->deleteJson("/api/employees/{$employee->id}");

        $response->assertStatus(200);
        $this->assertEquals('Inactive', $employee->fresh()->status);
    }
}
