<?php

namespace Database\Seeders;

use App\Models\Tutorial;
use App\Models\Category;
use App\Models\Lesson;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TutorialsTableSeeder extends Seeder
{
    public function run()
    {
        // First, make sure we have categories
        if (Category::count() === 0) {
            $this->call(CategoriesTableSeeder::class);
        }

        // Clear existing data
        DB::table('lessons')->delete();
        DB::table('tutorials')->delete();

        // Get categories
        $webDev = Category::where('slug', 'web-development')->first();
        $design = Category::where('slug', 'design')->first();
        $dataScience = Category::where('slug', 'data-science')->first();
        $programming = Category::where('slug', 'programming')->first();
        $marketing = Category::where('slug', 'marketing')->first();

        if (!$webDev || !$design || !$dataScience) {
            throw new \Exception('Required categories not found!');
        }

        $tutorials = [
            [
                'title' => 'Modern React Development',
                'description' => 'Learn React 18 with hooks, context, and modern best practices for building scalable applications.',
                'category_id' => $webDev->id,
                'duration' => '8h 30m',
                'students' => 12450,
                'rating' => 4.8,
                'level' => 'Intermediate',
                'image' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop',
                'instructor' => 'Sarah Johnson',
                'instructor_bio' => 'Senior Frontend Developer with 8+ years of experience building scalable web applications.',
                'instructor_experience' => '8+ years experience',
                'lessons' => 8,
                'price' => 49.99,
                'is_published' => true,
                'learning_objectives' => json_encode([
                    'Master React hooks and context API',
                    'Build real-world applications',
                    'Learn state management best practices',
                    'Understand component lifecycle',
                    'Implement routing and navigation',
                    'Deploy React applications'
                ]),
                'includes' => json_encode([
                    'Lifetime access',
                    'Certificate of completion',
                    'Downloadable resources',
                    'Q&A support',
                    'Source code'
                ])
            ],
            [
                'title' => 'UI/UX Design Fundamentals',
                'description' => 'Master the principles of user interface and user experience design with real-world projects.',
                'category_id' => $design->id,
                'duration' => '6h 15m',
                'students' => 8920,
                'rating' => 4.9,
                'level' => 'Beginner',
                'image' => 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop',
                'instructor' => 'Michael Chen',
                'instructor_bio' => 'Award-winning designer with expertise in creating intuitive user experiences for Fortune 500 companies.',
                'instructor_experience' => '10+ years experience',
                'lessons' => 7,
                'price' => 39.99,
                'is_published' => true,
                'learning_objectives' => json_encode([
                    'Understand design principles',
                    'Create wireframes and prototypes',
                    'Conduct user research',
                    'Design responsive interfaces',
                    'Use design tools effectively',
                    'Build design systems'
                ]),
                'includes' => json_encode([
                    'Lifetime access',
                    'Certificate of completion',
                    'Design templates',
                    'Project files',
                    'Community access'
                ])
            ],
            [
                'title' => 'Python for Data Science',
                'description' => 'Comprehensive guide to data analysis, visualization, and machine learning with Python.',
                'category_id' => $dataScience->id,
                'duration' => '12h 45m',
                'students' => 15670,
                'rating' => 4.7,
                'level' => 'Advanced',
                'image' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop',
                'instructor' => 'Dr. Emily Watson',
                'instructor_bio' => 'Data Scientist and Researcher with PhD in Computer Science. Former Google AI researcher.',
                'instructor_experience' => '12+ years experience',
                'lessons' => 10,
                'price' => 59.99,
                'is_published' => true,
                'learning_objectives' => json_encode([
                    'Master Python for data analysis',
                    'Work with pandas and NumPy',
                    'Create data visualizations',
                    'Build machine learning models',
                    'Handle big data efficiently',
                    'Deploy data science projects'
                ]),
                'includes' => json_encode([
                    'Lifetime access',
                    'Certificate of completion',
                    'Jupyter notebooks',
                    'Datasets for practice',
                    'ML model templates'
                ])
            ],
            [
                'title' => 'JavaScript Mastery',
                'description' => 'From fundamentals to advanced concepts. Master JavaScript and become a proficient developer.',
                'category_id' => $programming->id,
                'duration' => '10h 20m',
                'students' => 20340,
                'rating' => 4.6,
                'level' => 'Intermediate',
                'image' => 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&auto=format&fit=crop',
                'instructor' => 'Alex Thompson',
                'instructor_bio' => 'Full-stack developer and educator with passion for teaching programming concepts.',
                'instructor_experience' => '7+ years experience',
                'lessons' => 9,
                'price' => 44.99,
                'is_published' => true,
                'learning_objectives' => json_encode([
                    'Master JavaScript fundamentals',
                    'Understand asynchronous programming',
                    'Work with APIs and fetch data',
                    'Build interactive web applications',
                    'Learn modern ES6+ features',
                    'Debug and optimize code'
                ]),
                'includes' => json_encode([
                    'Lifetime access',
                    'Certificate of completion',
                    'Coding exercises',
                    'Real-world projects',
                    'Code reviews'
                ])
            ],
            [
                'title' => 'Digital Marketing Strategy',
                'description' => 'Learn to create effective digital marketing campaigns that drive results and ROI.',
                'category_id' => $marketing->id,
                'duration' => '5h 45m',
                'students' => 7850,
                'rating' => 4.5,
                'level' => 'Beginner',
                'image' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
                'instructor' => 'Jessica Martinez',
                'instructor_bio' => 'Digital marketing expert with proven track record of successful campaigns for major brands.',
                'instructor_experience' => '9+ years experience',
                'lessons' => 6,
                'price' => 34.99,
                'is_published' => true,
                'learning_objectives' => json_encode([
                    'Develop marketing strategies',
                    'Create social media campaigns',
                    'Analyze marketing metrics',
                    'Optimize conversion rates',
                    'Use SEO effectively',
                    'Build brand awareness'
                ]),
                'includes' => json_encode([
                    'Lifetime access',
                    'Certificate of completion',
                    'Marketing templates',
                    'Case studies',
                    'Strategy worksheets'
                ])
            ],
            [
                'title' => 'Laravel Backend Development',
                'description' => 'Build robust and scalable backend applications with Laravel PHP framework.',
                'category_id' => $webDev->id,
                'duration' => '9h 15m',
                'students' => 9340,
                'rating' => 4.8,
                'level' => 'Intermediate',
                'image' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
                'instructor' => 'David Wilson',
                'instructor_bio' => 'Backend specialist and Laravel expert with extensive experience in API development.',
                'instructor_experience' => '6+ years experience',
                'lessons' => 8,
                'price' => 52.99,
                'is_published' => true,
                'learning_objectives' => json_encode([
                    'Master Laravel fundamentals',
                    'Build RESTful APIs',
                    'Implement authentication',
                    'Work with databases',
                    'Create admin panels',
                    'Deploy applications'
                ]),
                'includes' => json_encode([
                    'Lifetime access',
                    'Certificate of completion',
                    'API documentation',
                    'Database schemas',
                    'Deployment guides'
                ])
            ],
        ];

        foreach ($tutorials as $tutorialData) {
            $tutorial = Tutorial::create($tutorialData);
            $this->createLessonsForTutorial($tutorial);
            
            echo "Created tutorial: " . $tutorial->title . " (ID: " . $tutorial->id . ")\n";
        }
    }

    private function createLessonsForTutorial(Tutorial $tutorial)
    {
        $lessonTemplates = [
            'React' => [
                ['title' => 'Introduction to React', 'duration' => '25 min', 'order' => 1, 'is_preview' => true, 'is_locked' => false],
                ['title' => 'JSX and Components', 'duration' => '35 min', 'order' => 2, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Props and State', 'duration' => '40 min', 'order' => 3, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'React Hooks', 'duration' => '45 min', 'order' => 4, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Context API', 'duration' => '30 min', 'order' => 5, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'React Router', 'duration' => '35 min', 'order' => 6, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'State Management', 'duration' => '50 min', 'order' => 7, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Testing React Apps', 'duration' => '40 min', 'order' => 8, 'is_preview' => false, 'is_locked' => true],
            ],
            'UI/UX' => [
                ['title' => 'Design Thinking Process', 'duration' => '20 min', 'order' => 1, 'is_preview' => true, 'is_locked' => false],
                ['title' => 'User Research Methods', 'duration' => '35 min', 'order' => 2, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Wireframing Techniques', 'duration' => '25 min', 'order' => 3, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Prototyping Tools', 'duration' => '30 min', 'order' => 4, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Usability Testing', 'duration' => '40 min', 'order' => 5, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Design Systems', 'duration' => '45 min', 'order' => 6, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Responsive Design', 'duration' => '35 min', 'order' => 7, 'is_preview' => false, 'is_locked' => true],
            ],
            'Python' => [
                ['title' => 'Python Basics for Data Science', 'duration' => '35 min', 'order' => 1, 'is_preview' => true, 'is_locked' => false],
                ['title' => 'NumPy Fundamentals', 'duration' => '45 min', 'order' => 2, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Pandas Data Analysis', 'duration' => '50 min', 'order' => 3, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Data Visualization with Matplotlib', 'duration' => '40 min', 'order' => 4, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Introduction to Machine Learning', 'duration' => '55 min', 'order' => 5, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Data Cleaning Techniques', 'duration' => '45 min', 'order' => 6, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Statistical Analysis', 'duration' => '50 min', 'order' => 7, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Working with APIs', 'duration' => '40 min', 'order' => 8, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Data Pipelines', 'duration' => '55 min', 'order' => 9, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Project: Data Analysis', 'duration' => '60 min', 'order' => 10, 'is_preview' => false, 'is_locked' => true],
            ],
            'JavaScript' => [
                ['title' => 'JavaScript Fundamentals', 'duration' => '30 min', 'order' => 1, 'is_preview' => true, 'is_locked' => false],
                ['title' => 'Functions and Scope', 'duration' => '35 min', 'order' => 2, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Arrays and Objects', 'duration' => '40 min', 'order' => 3, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'DOM Manipulation', 'duration' => '45 min', 'order' => 4, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Async Programming', 'duration' => '50 min', 'order' => 5, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'ES6+ Features', 'duration' => '40 min', 'order' => 6, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Working with APIs', 'duration' => '45 min', 'order' => 7, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Error Handling', 'duration' => '35 min', 'order' => 8, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Project: Weather App', 'duration' => '55 min', 'order' => 9, 'is_preview' => false, 'is_locked' => true],
            ],
            'Marketing' => [
                ['title' => 'Marketing Fundamentals', 'duration' => '25 min', 'order' => 1, 'is_preview' => true, 'is_locked' => false],
                ['title' => 'Social Media Strategy', 'duration' => '35 min', 'order' => 2, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Content Marketing', 'duration' => '40 min', 'order' => 3, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'SEO Optimization', 'duration' => '45 min', 'order' => 4, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Email Marketing', 'duration' => '30 min', 'order' => 5, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Analytics and Metrics', 'duration' => '35 min', 'order' => 6, 'is_preview' => false, 'is_locked' => true],
            ],
            'Laravel' => [
                ['title' => 'Laravel Setup and Basics', 'duration' => '30 min', 'order' => 1, 'is_preview' => true, 'is_locked' => false],
                ['title' => 'Routing and Controllers', 'duration' => '40 min', 'order' => 2, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Database and Eloquent', 'duration' => '50 min', 'order' => 3, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Authentication System', 'duration' => '45 min', 'order' => 4, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Building REST API', 'duration' => '55 min', 'order' => 5, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Middleware and Security', 'duration' => '40 min', 'order' => 6, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Testing Applications', 'duration' => '45 min', 'order' => 7, 'is_preview' => false, 'is_locked' => true],
                ['title' => 'Deployment', 'duration' => '35 min', 'order' => 8, 'is_preview' => false, 'is_locked' => true],
            ]
        ];

        $templateKey = match(true) {
            str_contains($tutorial->title, 'React') => 'React',
            str_contains($tutorial->title, 'UI/UX') => 'UI/UX',
            str_contains($tutorial->title, 'Python') => 'Python',
            str_contains($tutorial->title, 'JavaScript') => 'JavaScript',
            str_contains($tutorial->title, 'Marketing') => 'Marketing',
            str_contains($tutorial->title, 'Laravel') => 'Laravel',
            default => 'React'
        };

        $lessons = $lessonTemplates[$templateKey];

        foreach ($lessons as $lessonData) {
            Lesson::create(array_merge($lessonData, [
                'tutorial_id' => $tutorial->id,
                'description' => "Learn {$lessonData['title']} in this comprehensive lesson.",
                'video_url' => 'https://example.com/video/' . uniqid(),
                'content' => "This lesson covers {$lessonData['title']} in detail with practical examples and exercises."
            ]));
        }
        
        // Update the lessons count to match actual created lessons
        $tutorial->update(['lessons' => count($lessons)]);
        
        echo "Created " . count($lessons) . " lessons for: " . $tutorial->title . "\n";
    }
}