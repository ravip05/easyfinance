<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\CommissionSlab;
class CommissionSlabSeeder extends Seeder {
    public function run(): void {
        $slabs = [
            ['role'=>'staff',  'loan_type'=>'Home Loan',    'rate'=>0.0025,'min_disbursement'=>500000],
            ['role'=>'staff',  'loan_type'=>'Business Loan','rate'=>0.0030,'min_disbursement'=>300000],
            ['role'=>'manager','loan_type'=>'All',          'rate'=>0.0015,'min_disbursement'=>500000],
            ['role'=>'dsa',    'loan_type'=>'All',          'rate'=>0.0035,'min_disbursement'=>200000],
        ];
        foreach ($slabs as $s) CommissionSlab::firstOrCreate(['role'=>$s['role'],'loan_type'=>$s['loan_type']],$s);
        echo "  Commission slabs seeded.\n";
    }
}
