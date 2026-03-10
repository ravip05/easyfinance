    <?php
    namespace Database\Seeders;
    use Illuminate\Database\Seeder;
    use App\Models\Franchise;
    class FranchiseSeeder extends Seeder {
        public function run(): void {
            $data = [
                ['name'=>'Mumbai West DSA', 'code'=>'EFW-MUM01','owner_name'=>'Rohit Shah',   'city'=>'Mumbai',    'commission_rate'=>0.003, 'status'=>'Active'],
                ['name'=>'Pune Central',    'code'=>'EFW-PUN01','owner_name'=>'Sanjay Patil', 'city'=>'Pune',      'commission_rate'=>0.0028,'status'=>'Active'],
                ['name'=>'Delhi North',     'code'=>'EFW-DEL01','owner_name'=>'Vikram Arora', 'city'=>'Delhi',     'commission_rate'=>0.0025,'status'=>'Active'],
                ['name'=>'Bangalore IDC',   'code'=>'EFW-BLR01','owner_name'=>'Ramesh Kumar', 'city'=>'Bangalore', 'commission_rate'=>0.003, 'status'=>'Inactive'],
            ];
            foreach ($data as $d) Franchise::firstOrCreate(['code'=>$d['code']], $d);
            echo "  Franchises seeded.\n";
        }
    }
