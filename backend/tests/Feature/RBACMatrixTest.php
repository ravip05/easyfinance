<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Franchise;
use App\Models\Lead;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RBACMatrixTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Data provider for RBAC Matrix.
     * [Endpoint, Method, Role, ExpectedStatus]
     */
    public static function rbacDataProvider(): array
    {
        return [
            // Lead Access
            ['/api/leads', 'GET', 'admin', 200],
            ['/api/leads', 'GET', 'manager', 200],
            ['/api/leads', 'GET', 'staff', 200],
            ['/api/leads', 'GET', 'dsa', 200],
            ['/api/leads', 'GET', 'client', 200],

            // Employee Access (Internal Management)
            ['/api/employees', 'GET', 'admin', 200],
            ['/api/employees', 'GET', 'manager', 200],
            ['/api/employees', 'GET', 'staff', 403],
            ['/api/employees', 'GET', 'dsa', 403],
            ['/api/employees', 'GET', 'client', 403],

            // Franchise Access
            ['/api/franchises', 'GET', 'admin', 200],
            ['/api/franchises', 'GET', 'manager', 200],
            ['/api/franchises', 'GET', 'staff', 403],
            ['/api/franchises', 'GET', 'dsa', 403], // DSA can't see list, only own franchise (controller enforces this)
            ['/api/franchises', 'GET', 'client', 403],

            // HR / Infrastructure
            ['/api/holidays', 'POST', 'admin', 201],
            ['/api/holidays', 'POST', 'manager', 403],
            ['/api/holidays', 'POST', 'staff', 403],
            ['/api/holidays', 'POST', 'dsa', 403],
            
            // Company Policies Store
            ['/api/company-policies', 'POST', 'admin', 201],
            ['/api/company-policies', 'POST', 'manager', 403],
        ];
    }

    /**
     * @dataProvider rbacDataProvider
     */
    public function test_rbac_matrix($url, $method, $role, $expectedStatus)
    {
        $user = User::factory()->create(['role' => $role]);
        
        // Setup dependencies for certain routes
        if ($role === 'dsa') {
            $franchise = Franchise::factory()->create();
            $user->update(['franchise_id' => $franchise->id]);
        }
        
        $payload = [];
        if ($method === 'POST') {
            if (str_contains($url, 'holidays')) {
                $payload = ['title' => 'Test Holiday', 'date' => '2026-01-01'];
            } elseif (str_contains($url, 'company-policies')) {
                $payload = ['title' => 'Test Policy', 'content' => 'Content'];
            }
        }

        $response = $this->actingAs($user)->json($method, $url, $payload);

        $response->assertStatus($expectedStatus);
    }
}
