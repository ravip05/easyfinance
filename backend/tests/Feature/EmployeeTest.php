<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_employees()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(5)->create(['role' => 'staff']);

        $response = $this->actingAs($admin)->getJson('/api/employees?role=staff');

        $response->assertStatus(200);
        // Depending on controller implementation, 'data' or root array
        $json = $response->json();
        $data = isset($json['data']) ? $json['data'] : $json;
        $this->assertGreaterThanOrEqual(5, count($data));
    }

    public function test_admin_can_create_employee()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employeeData = [
            'name' => 'New Employee',
            'email' => 'new@easyfinance.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'staff',
            'phone' => '1234567890'
        ];

        $response = $this->actingAs($admin)->postJson('/api/employees', $employeeData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'new@easyfinance.com']);
    }

    public function test_staff_cannot_list_employees()
    {
        $staff = User::factory()->create(['role' => 'staff']);
        
        $response = $this->actingAs($staff)->getJson('/api/employees');

        // Based on current RBAC, staff usually can't see other users
        $response->assertStatus(403);
    }
}
