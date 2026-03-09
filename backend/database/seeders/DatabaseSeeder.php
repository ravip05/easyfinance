<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
class DatabaseSeeder extends Seeder {
    public function run(): void {
        $this->call([
            FranchiseSeeder::class,
            UserSeeder::class,
            LeadSeeder::class,
            BankPolicySeeder::class,
            SettingsSeeder::class,
        ]);
    }
}