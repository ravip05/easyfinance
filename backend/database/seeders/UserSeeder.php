<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Franchise;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder {
    public function run(): void {
        $franchise = Franchise::first();
        $admin = User::updateOrCreate(['email'=>'admin@easyfinancewale.in'],[
            'emp_code'=>'EF-001','name'=>'Admin User',
            'password'=>Hash::make('admin123'),'role'=>'admin',
            'department'=>'All Departments','phone'=>'9000000001','status'=>'Active',
        ]);
        $manager = User::updateOrCreate(['email'=>'priya@easyfinancewale.in'],[
            'emp_code'=>'EF-002','name'=>'Priya Singh',
            'password'=>Hash::make('mgr123'),'role'=>'manager',
            'department'=>'Home Loans','phone'=>'9000000002','status'=>'Active',
            'team_leader_id'=>$admin->id,
        ]);
        $staffData = [
            ['emp_code'=>'EF-003','name'=>'Amit Kumar','email'=>'amit@easyfinancewale.in','password'=>Hash::make('staff123'),'department'=>'Business Loans','phone'=>'9000000003'],
            ['emp_code'=>'EF-004','name'=>'Raj Mehta','email'=>'raj@easyfinancewale.in','password'=>Hash::make('staff123'),'department'=>'Personal Loans','phone'=>'9000000004'],
            ['emp_code'=>'EF-005','name'=>'Neha Verma','email'=>'neha@easyfinancewale.in','password'=>Hash::make('staff123'),'department'=>'Insurance','phone'=>'9000000005'],
        ];
        foreach ($staffData as $d) {
            User::updateOrCreate(['email'=>$d['email']], array_merge($d, [
                'role'=>'staff','status'=>'Active','team_leader_id'=>$manager->id,
            ]));
        }
        if ($franchise) {
            User::updateOrCreate(['email'=>'mumbaidsa@easyfinancewale.in'],[
                'emp_code'=>'EF-DSA-001','name'=>'Mumbai DSA',
                'password'=>Hash::make('dsa123'),'role'=>'dsa',
                'department'=>'DSA Partner','phone'=>'9000000006',
                'status'=>'Active','franchise_id'=>$franchise->id,
            ]);
        }
        $this->command->info('Users seeded');
    }
}