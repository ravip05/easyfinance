<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Department;
class DepartmentSeeder extends Seeder {
    public function run(): void {
        foreach(['Home Loans','Business Loans','Personal Loans','Car Loans','LAP','Insurance','CIBIL','Operations','HR','IT'] as $d)
            Department::firstOrCreate(['name'=>$d],['is_active'=>true]);
        echo "  Departments seeded.\n";
    }
}
