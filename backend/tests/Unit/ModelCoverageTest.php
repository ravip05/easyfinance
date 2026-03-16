<?php

namespace Tests\Unit\Models;

use App\Models\Lead;
use App\Models\User;
use App\Models\Franchise;
use App\Models\Client;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelCoverageTest extends TestCase
{
    use RefreshDatabase;

    public function test_lead_accessors()
    {
        $lead = new Lead([
            'name' => 'John Doe',
            'amount' => 4500000,
            'follow_up_date' => now()->subDay(),
            'stage' => 'New'
        ]);

        $this->assertEquals('₹45L', $lead->amount_formatted);
        $this->assertEquals('JD', $lead->initials);
        $this->assertTrue($lead->is_overdue);

        $lead->amount = 10000000;
        $this->assertEquals('₹1.0Cr', $lead->amount_formatted);

        $lead->amount = 50000;
        $this->assertEquals('₹50,000', $lead->amount_formatted);
    }

    public function test_user_accessors()
    {
        $user = new User([
            'name' => 'Jane Smith',
            'commission_rate' => 0.0025
        ]);

        $this->assertEquals('JS', $user->initials);
        $this->assertEquals('0.25%', $user->commission_rate_display);
    }

    public function test_franchise_accessors()
    {
        $franchise = new Franchise([
            'name' => 'Mumbai North',
            'commission_rate' => 0.003
        ]);

        $this->assertEquals('0.30%', $franchise->commission_rate_display);
    }

    public function test_client_accessors()
    {
        $client = new Client([
            'name' => 'Rahul Kapoor',
            'cibil_score' => 780,
            'amount' => 5000000
        ]);

        $this->assertEquals('RK', $client->initials);
        $this->assertEquals('excellent', $client->cibil_category);
        $this->assertEquals('₹50L', $client->amount_formatted);

        $client->cibil_score = 700;
        $this->assertEquals('good', $client->cibil_category);

        $client->cibil_score = 600;
        $this->assertEquals('poor', $client->cibil_category);
    }
}
