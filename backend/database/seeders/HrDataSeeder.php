<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\LeaveRequest;
use App\Models\CompanyPolicy;
use Carbon\Carbon;

class HrDataSeeder extends Seeder
{
    public function run(): void
    {
        // ── Company Policies ──
        $policies = [
            [
                'title' => 'General Code of Conduct',
                'category' => 'Operations',
                'content' => "At EasyFinance, we maintain the highest standards of professional integrity. \n\n1. Attendance: All employees are expected to be on time.\n2. Respect: Treat colleagues and clients with dignity.\n3. Confidentiality: Client data is sacred and must not be shared outside the platform.",
                'version' => '1.2',
                'is_active' => true,
            ],
            [
                'title' => 'Leave & Attendance Policy',
                'category' => 'HR',
                'content' => "Our team's well-being is a priority. \n\n- Sick Leave: Up to 10 days per year with medical certificate.\n- Casual Leave: Up to 8 days per year. \n- Working Hours: Mon-Fri, 9:30 AM to 6:30 PM.",
                'version' => '2.0',
                'is_active' => true,
            ],
            [
                'title' => 'Digital Security Policy',
                'category' => 'IT',
                'content' => "Ensuring data safety is everyone's responsibility. \n\n- Use strong passwords and change them every 90 days. \n- Do not share login credentials. \n- Report any suspicious activity to the IT department immediately.",
                'version' => '1.0',
                'is_active' => true,
            ],
        ];

        foreach ($policies as $p) {
            CompanyPolicy::updateOrCreate(['title' => $p['title']], $p);
        }

        // ── Dummy Leave Requests ──
        $users = User::whereIn('email', [
            'amit@easyfinancewale.in', 
            'raj@easyfinancewale.in', 
            'neha@easyfinancewale.in',
            'priya@easyfinancewale.in'
        ])->get();

        $admin = User::where('role', 'admin')->first();

        if ($users->count() > 0) {
            $leaves = [
                // amit - sick leave - approved
                [
                    'user_id' => $users->where('email', 'amit@easyfinancewale.in')->first()->id,
                    'type' => 'Sick Leave',
                    'start_date' => Carbon::now()->subDays(10)->format('Y-m-d'),
                    'end_date' => Carbon::now()->subDays(8)->format('Y-m-d'),
                    'reason' => 'Severe fever and body ache.',
                    'status' => 'Approved',
                    'approved_by' => $admin->id,
                    'actioned_at' => Carbon::now()->subDays(11),
                ],
                // raj - casual leave - pending
                [
                    'user_id' => $users->where('email', 'raj@easyfinancewale.in')->first()->id,
                    'type' => 'Casual Leave',
                    'start_date' => Carbon::now()->addDays(5)->format('Y-m-d'),
                    'end_date' => Carbon::now()->addDays(7)->format('Y-m-d'),
                    'reason' => 'Attending family wedding in hometown.',
                    'status' => 'Pending',
                ],
                // neha - sick leave - pending
                [
                    'user_id' => $users->where('email', 'neha@easyfinancewale.in')->first()->id,
                    'type' => 'Sick Leave',
                    'start_date' => Carbon::now()->format('Y-m-d'),
                    'end_date' => Carbon::now()->addDay()->format('Y-m-d'),
                    'reason' => 'Doctor consultation for persistent migraine.',
                    'status' => 'Pending',
                ],
                // neha - earned leave - rejected
                [
                    'user_id' => $users->where('email', 'neha@easyfinancewale.in')->first()->id,
                    'type' => 'Earned Leave',
                    'start_date' => Carbon::now()->subDays(20)->format('Y-m-d'),
                    'end_date' => Carbon::now()->subDays(15)->format('Y-m-d'),
                    'reason' => 'Overseas trip planning.',
                    'status' => 'Rejected',
                    'rejection_note' => 'Project deadline clash. Please reschedule for next month.',
                    'approved_by' => $admin->id,
                    'actioned_at' => Carbon::now()->subDays(25),
                ],
                // priya (manager) - other - approved
                [
                    'user_id' => $users->where('email', 'priya@easyfinancewale.in')->first()->id,
                    'type' => 'Other',
                    'start_date' => Carbon::now()->subDays(2)->format('Y-m-d'),
                    'end_date' => Carbon::now()->addDays(2)->format('Y-m-d'),
                    'reason' => 'Working remotely for family reasons.',
                    'status' => 'Approved',
                    'approved_by' => $admin->id,
                    'actioned_at' => Carbon::now()->subDays(5),
                ],
            ];

            foreach ($leaves as $l) {
                LeaveRequest::create($l);
            }
        }

        echo "  HR dummy data (Policies & Leaves) seeded.\n";
    }
}
