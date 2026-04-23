<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Holiday;

class IndianHolidaySeeder extends Seeder
{
    public function run(): void
    {
        $holidays = [
            ['title' => 'Republic Day',                'date' => '2026-01-26', 'type' => 'national'],
            ['title' => 'Maha Shivaratri',             'date' => '2026-02-15', 'type' => 'national'],
            ['title' => 'Holi',                        'date' => '2026-03-14', 'type' => 'national'],
            ['title' => 'Eid ul-Fitr',                 'date' => '2026-03-21', 'type' => 'national'],
            ['title' => 'Good Friday',                 'date' => '2026-04-03', 'type' => 'national'],
            ['title' => 'Ram Navami',                  'date' => '2026-04-06', 'type' => 'national'],
            ['title' => 'Mahavir Jayanti',             'date' => '2026-04-09', 'type' => 'national'],
            ['title' => 'Dr. B.R. Ambedkar Jayanti',   'date' => '2026-04-14', 'type' => 'national'],
            ['title' => 'Buddha Purnima',              'date' => '2026-05-12', 'type' => 'national'],
            ['title' => 'Eid ul-Adha',                 'date' => '2026-05-27', 'type' => 'national'],
            ['title' => 'Muharram',                    'date' => '2026-06-26', 'type' => 'national'],
            ['title' => 'Raksha Bandhan',              'date' => '2026-08-11', 'type' => 'national'],
            ['title' => 'Janmashtami',                 'date' => '2026-08-14', 'type' => 'national'],
            ['title' => 'Independence Day',            'date' => '2026-08-15', 'type' => 'national'],
            ['title' => 'Milad un-Nabi',               'date' => '2026-08-26', 'type' => 'national'],
            ['title' => 'Ganesh Chaturthi',            'date' => '2026-09-07', 'type' => 'national'],
            ['title' => 'Mahatma Gandhi Jayanti',      'date' => '2026-10-02', 'type' => 'national'],
            ['title' => 'Navratri Begins',             'date' => '2026-10-03', 'type' => 'regional'],
            ['title' => 'Dussehra',                    'date' => '2026-10-12', 'type' => 'national'],
            ['title' => 'Karva Chauth',                'date' => '2026-10-23', 'type' => 'regional'],
            ['title' => 'Diwali',                      'date' => '2026-10-31', 'type' => 'national'],
            ['title' => 'Govardhan Puja',              'date' => '2026-11-01', 'type' => 'regional'],
            ['title' => 'Bhai Dooj',                   'date' => '2026-11-02', 'type' => 'national'],
            ['title' => 'Chhath Puja',                 'date' => '2026-11-06', 'type' => 'regional'],
            ['title' => 'Guru Nanak Jayanti',          'date' => '2026-11-18', 'type' => 'national'],
            ['title' => 'Christmas Day',               'date' => '2026-12-25', 'type' => 'national'],
        ];

        foreach ($holidays as $h) {
            Holiday::firstOrCreate(
                ['date' => $h['date'], 'title' => $h['title']],
                $h
            );
        }

        $this->command->info(count($holidays) . ' Indian holidays seeded for 2026.');
    }
}
