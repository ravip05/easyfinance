<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
class DatabaseSeeder extends Seeder {
    public function run(): void {
        $this->call([
            DepartmentSeeder::class,
            FranchiseSeeder::class,
            UserSeeder::class,
            LeadSeeder::class,
            BankPolicySeeder::class,
            IndianHolidaySeeder::class,
            HrDataSeeder::class,
            PipelineStageSeeder::class,
            SettingsSeeder::class,
        ]);
    }
}