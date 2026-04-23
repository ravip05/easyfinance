<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\{LmsCourse,LmsLesson,LmsMaterial,Quiz,QuizQuestion};
class LmsCourseSeeder extends Seeder {
    public function run(): void {
        $courses = [
            ['title'=>'Home Loan Basics',          'thumbnail'=>'🏠','category'=>'loans',     'level'=>'beginner',    'duration_minutes'=>135,'lesson_count'=>8, 'sort_order'=>1],
            ['title'=>'Business Loan Processing',  'thumbnail'=>'💼','category'=>'loans',     'level'=>'intermediate','duration_minutes'=>210,'lesson_count'=>12,'sort_order'=>2],
            ['title'=>'CIBIL Score Mastery',       'thumbnail'=>'📊','category'=>'loans',     'level'=>'beginner',    'duration_minutes'=>105,'lesson_count'=>6, 'sort_order'=>3],
            ['title'=>'Insurance Products',        'thumbnail'=>'🛡','category'=>'insurance', 'level'=>'beginner',    'duration_minutes'=>120,'lesson_count'=>9, 'sort_order'=>4],
            ['title'=>'Advanced Sales Techniques', 'thumbnail'=>'🎯','category'=>'sales',     'level'=>'advanced',    'duration_minutes'=>240,'lesson_count'=>15,'sort_order'=>5],
            ['title'=>'KYC & Compliance Guide',    'thumbnail'=>'📋','category'=>'compliance','level'=>'intermediate','duration_minutes'=>90, 'lesson_count'=>7, 'sort_order'=>6],
            ['title'=>'Personal Loan & LAP',       'thumbnail'=>'👤','category'=>'loans',     'level'=>'intermediate','duration_minutes'=>165,'lesson_count'=>10,'sort_order'=>7],
            ['title'=>'Customer Handling & CRM',   'thumbnail'=>'🤝','category'=>'sales',     'level'=>'beginner',    'duration_minutes'=>180,'lesson_count'=>11,'sort_order'=>8],
        ];
        foreach ($courses as $c) {
            $course = LmsCourse::firstOrCreate(['title'=>$c['title']], array_merge($c,['is_active'=>true]));
            $types = ['video','text','pdf','video','text','quiz','video','pdf','text','video','text','video'];
            for ($i=1;$i<=$c['lesson_count'];$i++) {
                LmsLesson::firstOrCreate(['course_id'=>$course->id,'sort_order'=>$i],[
                    'title'=>"Lesson $i: ".ucwords($c['category'])." Topic $i",
                    'type'=>$types[($i-1)%count($types)],'duration_minutes'=>rand(8,20),
                    'content'=>"Content for lesson $i of ".$c['title'],
                ]);
            }
        }
        $mats = [
            ['title'=>'Home Loan KYC Checklist 2025',       'category'=>'Loans',      'type'=>'PDF',         'file_size'=>'1.2 MB','view_count'=>142],
            ['title'=>'SBI Home Loan Policy Update Q1 2025','category'=>'Loans',      'type'=>'PDF',         'file_size'=>'890 KB','view_count'=>98],
            ['title'=>'HDFC Business Loan Criteria',        'category'=>'Loans',      'type'=>'PDF',         'file_size'=>'1.5 MB','view_count'=>76],
            ['title'=>'CIBIL Improvement 30-Day Plan',      'category'=>'Loans',      'type'=>'PDF',         'file_size'=>'650 KB','view_count'=>211],
            ['title'=>'LIC Term Insurance Product Guide',   'category'=>'Insurance',  'type'=>'PDF',         'file_size'=>'3.2 MB','view_count'=>54],
            ['title'=>'Sales Objection Handling Scripts',   'category'=>'Sales',      'type'=>'Presentation','file_size'=>'4.1 MB','view_count'=>187],
            ['title'=>'FOIR Calculation Template',          'category'=>'Loans',      'type'=>'Spreadsheet', 'file_size'=>'280 KB','view_count'=>320],
            ['title'=>'HR Policy Manual',                   'category'=>'HR Policies','type'=>'PDF',         'file_size'=>'5.8 MB','view_count'=>89],
        ];
        foreach ($mats as $m) LmsMaterial::firstOrCreate(['title'=>$m['title']],$m);
        $quiz = Quiz::firstOrCreate(['title'=>'Home Loan KYC Quiz'],[
            'course_id'=>LmsCourse::where('title','Home Loan Basics')->first()?->id,
            'passing_score'=>70,'time_limit_minutes'=>10,'is_active'=>true,
        ]);
        foreach ([
            ['question'=>'What does KYC stand for?','options'=>['A'=>'Know Your Customer','B'=>'Keep Your Cash','C'=>'Know Your Credit','D'=>'None'],'correct_answer'=>'A'],
            ['question'=>'Min CIBIL for most home loans?','options'=>['A'=>'600','B'=>'650','C'=>'700','D'=>'750'],'correct_answer'=>'C'],
            ['question'=>'What is FOIR?','options'=>['A'=>'Fixed Obligation to Income Ratio','B'=>'Fixed Offer Interest Rate','C'=>'Financial Obligation Installment Ratio','D'=>'None'],'correct_answer'=>'A'],
        ] as $q) QuizQuestion::firstOrCreate(['quiz_id'=>$quiz->id,'question'=>$q['question']],$q);
        echo "  LMS data seeded.\n";
    }
}
