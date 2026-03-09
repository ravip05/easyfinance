<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\BankPolicy;
class BankPolicySeeder extends Seeder {
    public function run(): void {
        $banks = [
            ['bank_name'=>'SBI',           'bank_code'=>'SBI',  'bank_type'=>'PSU',    'color'=>'#1d4ed8','bg_color'=>'#dbeafe','hl_rate'=>'8.50%','hl_max'=>'₹10Cr','hl_tenure'=>'30 yrs','hl_ltv'=>'90%','bl_rate'=>'11.15%','bl_max'=>'₹5Cr','bl_tenure'=>'15 yrs','pl_rate'=>'12.00%','pl_max'=>'₹20L','pl_tenure'=>'7 yrs','cibil_min'=>700,'income_min'=>'₹25K/mo','eligible_age'=>'21–70','processing_fee'=>'0.35%','prepayment'=>'Nil after 6 EMIs','highlight'=>'Best for govt & salaried employees','updated_policy_at'=>'2025-01-15'],
            ['bank_name'=>'HDFC Bank',     'bank_code'=>'HDFC', 'bank_type'=>'Private','color'=>'#dc2626','bg_color'=>'#fee2e2','hl_rate'=>'8.75%','hl_max'=>'₹15Cr','hl_tenure'=>'30 yrs','hl_ltv'=>'90%','bl_rate'=>'10.75%','bl_max'=>'₹50L','bl_tenure'=>'15 yrs','pl_rate'=>'10.85%','pl_max'=>'₹40L','pl_tenure'=>'5 yrs','cibil_min'=>700,'income_min'=>'₹20K/mo','eligible_age'=>'21–65','processing_fee'=>'0.50%','prepayment'=>'2% before 24 mo','highlight'=>'Fastest approval – 48 hrs','updated_policy_at'=>'2025-01-12'],
            ['bank_name'=>'ICICI Bank',    'bank_code'=>'ICICI','bank_type'=>'Private','color'=>'#ea580c','bg_color'=>'#fff7ed','hl_rate'=>'9.00%','hl_max'=>'₹10Cr','hl_tenure'=>'30 yrs','hl_ltv'=>'85%','bl_rate'=>'10.65%','bl_max'=>'₹2Cr', 'bl_tenure'=>'12 yrs','pl_rate'=>'10.75%','pl_max'=>'₹50L','pl_tenure'=>'6 yrs','cibil_min'=>720,'income_min'=>'₹25K/mo','eligible_age'=>'23–65','processing_fee'=>'0.50%','prepayment'=>'Nil after 12 mo','highlight'=>'Best digital application','updated_policy_at'=>'2025-01-10'],
            ['bank_name'=>'Axis Bank',     'bank_code'=>'AXIS', 'bank_type'=>'Private','color'=>'#7c3aed','bg_color'=>'#ede9fe','hl_rate'=>'8.65%','hl_max'=>'₹5Cr', 'hl_tenure'=>'30 yrs','hl_ltv'=>'80%','bl_rate'=>'10.95%','bl_max'=>'₹75L','bl_tenure'=>'15 yrs','pl_rate'=>'11.25%','pl_max'=>'₹40L','pl_tenure'=>'5 yrs','cibil_min'=>700,'income_min'=>'₹15K/mo','eligible_age'=>'21–65','processing_fee'=>'1%','prepayment'=>'Nil (floating)','highlight'=>'Flexible repayment options','updated_policy_at'=>'2025-01-08'],
            ['bank_name'=>'PNB Housing',   'bank_code'=>'PNB',  'bank_type'=>'NBFC',  'color'=>'#059669','bg_color'=>'#d1fae5','hl_rate'=>'8.45%','hl_max'=>'₹5Cr', 'hl_tenure'=>'30 yrs','hl_ltv'=>'90%','bl_rate'=>'12.50%','bl_max'=>'₹50L','bl_tenure'=>'10 yrs','pl_rate'=>'13.00%','pl_max'=>'₹15L','pl_tenure'=>'5 yrs','cibil_min'=>650,'income_min'=>'₹20K/mo','eligible_age'=>'21–70','processing_fee'=>'0.35%','prepayment'=>'Nil','highlight'=>'Lowest rate for CIBIL 750+','updated_policy_at'=>'2025-01-05'],
            ['bank_name'=>'Kotak Mahindra','bank_code'=>'KTKM', 'bank_type'=>'Private','color'=>'#0891b2','bg_color'=>'#ecfeff','hl_rate'=>'9.25%','hl_max'=>'₹10Cr','hl_tenure'=>'20 yrs','hl_ltv'=>'85%','bl_rate'=>'11.50%','bl_max'=>'₹5Cr','bl_tenure'=>'10 yrs','pl_rate'=>'10.99%','pl_max'=>'₹40L','pl_tenure'=>'5 yrs','cibil_min'=>720,'income_min'=>'₹30K/mo','eligible_age'=>'21–60','processing_fee'=>'0.50%','prepayment'=>'4% before 12 mo','highlight'=>'Best for self-employed','updated_policy_at'=>'2025-01-03'],
        ];
        foreach ($banks as $b) BankPolicy::firstOrCreate(['bank_code'=>$b['bank_code']],$b);
        echo "  Bank policies seeded.\n";
    }
}
