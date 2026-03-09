<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\PipelineStage;
class PipelineStageSeeder extends Seeder {
    public function run(): void {
        $stages = [
            ['name'=>'New','color'=>'#6b7280','sort_order'=>1],['name'=>'Contacted','color'=>'#2563eb','sort_order'=>2],
            ['name'=>'Docs Pending','color'=>'#d97706','sort_order'=>3],['name'=>'Docs Received','color'=>'#0891b2','sort_order'=>4],
            ['name'=>'CIBIL','color'=>'#7c3aed','sort_order'=>5],['name'=>'Login','color'=>'#059669','sort_order'=>6],
            ['name'=>'Processing','color'=>'#ea580c','sort_order'=>7],['name'=>'Sanctioned','color'=>'#16a34a','sort_order'=>8],
            ['name'=>'Disbursement','color'=>'#059669','sort_order'=>9],['name'=>'Closed','color'=>'#64748b','sort_order'=>10],
        ];
        foreach ($stages as $s) PipelineStage::firstOrCreate(['name'=>$s['name']],array_merge($s,['is_active'=>true]));
        echo "  Pipeline stages seeded.\n";
    }
}
