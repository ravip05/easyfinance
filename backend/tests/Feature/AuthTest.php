<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@easyfinance.com',
            'password' => Hash::make('password123'),
            'status' => 'Active'
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@easyfinance.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'token',
                'user' => [
                    'id', 'name', 'email', 'role', 'initials'
                ]
            ]);
    }

    public function test_user_cannot_login_with_invalid_password()
    {
        $user = User::factory()->create([
            'email' => 'test@easyfinance.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@easyfinance.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_inactive_user_cannot_login()
    {
        $user = User::factory()->create([
            'email' => 'inactive@easyfinance.com',
            'password' => Hash::make('password123'),
            'status' => 'Inactive'
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'inactive@easyfinance.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson(['success' => false]);
    }

    public function test_authenticated_user_can_get_profile()
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user)->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('user.email', $user->email);
    }

    public function test_user_can_logout()
    {
        $user = User::factory()->create();
        
        // Login to get a token
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password', // Default factory password is 'password'
        ]);
        
        $token = $loginResponse->json('token');

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
            
        $this->assertEmpty($user->tokens);
    }
}
