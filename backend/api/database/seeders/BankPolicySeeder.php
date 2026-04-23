<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BankPolicy;

class BankPolicySeeder extends Seeder
{
    public function run(): void
    {
        $banks = [

            [
                'name'=>'SBI',
                'logo_code'=>'SBI',
                'brand_color'=>'#1d4ed8',
                'bg_color'=>'#dbeafe',
                'bank_type'=>'PSU',

                'hl_interest_rate'=>'8.50%',
                'hl_max_amount'=>'₹10Cr',
                'hl_max_tenure'=>'30 yrs',
                'hl_ltv'=>'90%',

                'bl_interest_rate'=>'11.15%',
                'bl_max_amount'=>'₹5Cr',
                'bl_max_tenure'=>'15 yrs',

                'pl_interest_rate'=>'12.00%',
                'pl_max_amount'=>'₹20L',
                'pl_max_tenure'=>'7 yrs',

                'cibil_min'=>700,
                'min_income'=>'₹25K/mo',
                'age_range'=>'21–70',

                'processing_fee'=>'0.35%',
                'prepayment_clause'=>'Nil after 6 EMIs',

                'highlight'=>'Best for govt & salaried employees',
                'policy_updated_at'=>'2025-01-15'
            ],

            [
                'name'=>'HDFC Bank',
                'logo_code'=>'HDFC',
                'brand_color'=>'#dc2626',
                'bg_color'=>'#fee2e2',
                'bank_type'=>'Private',

                'hl_interest_rate'=>'8.75%',
                'hl_max_amount'=>'₹15Cr',
                'hl_max_tenure'=>'30 yrs',
                'hl_ltv'=>'90%',

                'bl_interest_rate'=>'10.75%',
                'bl_max_amount'=>'₹50L',
                'bl_max_tenure'=>'15 yrs',

                'pl_interest_rate'=>'10.85%',
                'pl_max_amount'=>'₹40L',
                'pl_max_tenure'=>'5 yrs',

                'cibil_min'=>700,
                'min_income'=>'₹20K/mo',
                'age_range'=>'21–65',

                'processing_fee'=>'0.50%',
                'prepayment_clause'=>'2% before 24 mo',

                'highlight'=>'Fastest approval – 48 hrs',
                'policy_updated_at'=>'2025-01-12'
            ],

        ];

        foreach ($banks as $b) {
            BankPolicy::firstOrCreate(
                ['name'=>$b['name']],
                $b
            );
        }

        echo "  Bank policies seeded.\n";
    }
}