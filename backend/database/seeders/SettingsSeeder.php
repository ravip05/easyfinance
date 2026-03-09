<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Setting;
class SettingsSeeder extends Seeder {
    public function run(): void {
        $settings = [
            ['key'=>'company_name',     'value'=>'EasyFinance Wale',     'group'=>'company'],
            ['key'=>'company_tagline',  'value'=>'Your Loan Simplified', 'group'=>'company'],
            ['key'=>'company_phone',    'value'=>'+91 9000000000',        'group'=>'company'],
            ['key'=>'company_email',    'value'=>'info@easyfinancewale.in','group'=>'company'],
            ['key'=>'currency_symbol',  'value'=>'₹',                    'group'=>'invoice'],
            ['key'=>'gst_percentage',   'value'=>'18',                   'group'=>'invoice'],
            ['key'=>'tds_percentage',   'value'=>'10',                   'group'=>'commission'],
            ['key'=>'payout_cycle',     'value'=>'monthly',              'group'=>'commission'],
            ['key'=>'session_timeout',  'value'=>'60',                   'group'=>'security'],
            ['key'=>'date_format',      'value'=>'d/m/Y',                'group'=>'general'],
        ];
        foreach ($settings as $s) Setting::updateOrCreate(['key'=>$s['key']],$s);
        echo "  Settings seeded.\n";
    }
}
