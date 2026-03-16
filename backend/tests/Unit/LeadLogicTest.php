<?php

namespace Tests\Unit;

use App\Models\Lead;
use Carbon\Carbon;
use Tests\TestCase;

class LeadLogicTest extends TestCase
{
    /**
     * Test amount formatting logic (Indian Style)
     */
    public function test_amount_formatting_boundary_values()
    {
        $lead = new Lead();

        // Thousands
        $lead->amount = 45000;
        $this->assertEquals('₹45,000', $lead->amount_formatted);

        // Lakhs
        $lead->amount = 4500000;
        $this->assertEquals('₹45L', $lead->amount_formatted);

        // Crores
        $lead->amount = 10000000;
        $this->assertEquals('₹1.0Cr', $lead->amount_formatted);

        // Null/Zero
        $lead->amount = 0;
        $this->assertEquals('TBD', $lead->amount_formatted);
    }

    /**
     * Test age calculation logic
     */
    public function test_age_calculation_edge_cases()
    {
        $lead = new Lead();

        // Regular Case
        $lead->birth_date = Carbon::parse('1990-01-01');
        $this->assertEquals(Carbon::parse('1990-01-01')->age, $lead->age);

        // Leap Year
        $lead->birth_date = Carbon::parse('2000-02-29');
        $this->assertEquals(Carbon::parse('2000-02-29')->age, $lead->age);

        // Future Date (Edge Case - should probably return 0 or null depending on biz rules)
        $lead->birth_date = Carbon::now()->addYear();
        $this->assertEquals(0, $lead->age); // Carbon age returns 0 for future dates

        // Null
        $lead->birth_date = null;
        $this->assertNull($lead->age);
    }

    /**
     * Test initials extraction
     */
    public function test_initials_extraction()
    {
        $lead = new Lead();

        $lead->name = 'Priya Singh';
        $this->assertEquals('PS', $lead->initials);

        $lead->name = 'Rajesh Kumar Maurya';
        $this->assertEquals('RK', $lead->initials); // Should take first two

        $lead->name = 'Amit';
        $this->assertEquals('A', $lead->initials);

        $lead->name = '';
        $this->assertEquals('', $lead->initials);
    }
}
