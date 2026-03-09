<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\{Lead,User,LeadTimeline};
class LeadSeeder extends Seeder {
    public function run(): void {
        $admin = User::where('email','admin@easyfinancewale.in')->first()?->id;
        $priya = User::where('email','priya@easyfinancewale.in')->first()?->id;
        $amit  = User::where('email','amit@easyfinancewale.in')->first()?->id;
        $raj   = User::where('email','raj@easyfinancewale.in')->first()?->id;
        $leads = [
            ['name'=>'Rajesh Kumar','phone'=>'9876543210','loan_type'=>'Home Loan',    'loan_amount'=>4500000,'stage'=>'Docs Pending','priority'=>'High',  'assigned_to'=>$priya,'color'=>'#2563eb','followup_date'=>'2025-03-10'],
            ['name'=>'Meena Patel', 'phone'=>'9876541234','loan_type'=>'Business Loan','loan_amount'=>2000000,'stage'=>'Login',       'priority'=>'High',  'assigned_to'=>$amit, 'color'=>'#059669','followup_date'=>'2025-03-08'],
            ['name'=>'Suresh Yadav','phone'=>'9876549999','loan_type'=>'Personal Loan','loan_amount'=>500000, 'stage'=>'New',         'priority'=>'Medium','assigned_to'=>null,  'color'=>'#d97706','followup_date'=>'2025-03-15'],
            ['name'=>'Anika Sharma','phone'=>'9876548888','loan_type'=>'Car Loan',     'loan_amount'=>800000, 'stage'=>'Sanctioned',  'priority'=>'Low',   'assigned_to'=>$raj,  'color'=>'#7c3aed','followup_date'=>'2025-03-20'],
            ['name'=>'Vivek Gupta', 'phone'=>'9876547777','loan_type'=>'Home Loan',    'loan_amount'=>6000000,'stage'=>'Disbursement','priority'=>'High',  'assigned_to'=>$priya,'color'=>'#0891b2','followup_date'=>'2025-03-25'],
            ['name'=>'Deepak Nair', 'phone'=>'9876546666','loan_type'=>'LAP',          'loan_amount'=>8000000,'stage'=>'CIBIL',       'priority'=>'High',  'assigned_to'=>$amit, 'color'=>'#ea580c','followup_date'=>'2025-03-07'],
            ['name'=>'Sunita Joshi','phone'=>'9876545555','loan_type'=>'Business Loan','loan_amount'=>3500000,'stage'=>'Processing',  'priority'=>'Medium','assigned_to'=>$raj,  'color'=>'#0891b2','followup_date'=>'2025-03-12'],
            ['name'=>'Arjun Singh', 'phone'=>'9876544444','loan_type'=>'Home Loan',    'loan_amount'=>9000000,'stage'=>'Contacted',   'priority'=>'High',  'assigned_to'=>$priya,'color'=>'#059669','followup_date'=>'2025-03-06'],
        ];
        foreach ($leads as $l) {
            $lead = Lead::firstOrCreate(['phone'=>$l['phone']], array_merge($l,['created_by'=>$admin,'source'=>'Direct']));
            LeadTimeline::firstOrCreate(['lead_id'=>$lead->id,'action'=>'Lead Created'],['user_id'=>$admin,'to_stage'=>$lead->stage,'notes'=>'Initial lead created']);
        }
        echo "  Leads seeded.\n";
    }
}
