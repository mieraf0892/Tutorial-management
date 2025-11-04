export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  students: number;
  rating: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  image: string;
  content?: string;
  instructor?: string;
  lessons?: number;
}

export const tutorialsData: Tutorial[] = [
  {
    id: "1",
    title: "Modern React Development",
    description: "Learn React 18 with hooks, context, and modern best practices for building scalable applications.",
    category: "Web Development",
    duration: "8h 30m",
    students: 12450,
    rating: 4.8,
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop",
    instructor: "Sarah Johnson",
    lessons: 45,
  },
  {
    id: "2",
    title: "UI/UX Design Fundamentals",
    description: "Master the principles of user interface and user experience design with real-world projects.",
    category: "Design",
    duration: "6h 15m",
    students: 8920,
    rating: 4.9,
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop",
    instructor: "Michael Chen",
    lessons: 32,
  },
  {
    id: "3",
    title: "Python for Data Science",
    description: "Comprehensive guide to data analysis, visualization, and machine learning with Python.",
    category: "Data Science",
    duration: "12h 45m",
    students: 15670,
    rating: 4.7,
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop",
    instructor: "Dr. Emily Watson",
    lessons: 68,
  },
  {
    id: "4",
    title: "Digital Marketing Essentials",
    description: "Learn SEO, content marketing, social media strategies, and analytics for business growth.",
    category: "Marketing",
    duration: "5h 20m",
    students: 6340,
    rating: 4.6,
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop",
    instructor: "David Miller",
    lessons: 28,
  },
  {
    id: "5",
    title: "Full Stack JavaScript",
    description: "Build complete web applications with Node.js, Express, MongoDB, and React from scratch.",
    category: "Web Development",
    duration: "15h 10m",
    students: 18920,
    rating: 4.9,
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop",
    instructor: "Alex Rodriguez",
    lessons: 82,
  },
  {
    id: "6",
    title: "Mobile App Design",
    description: "Create beautiful and functional mobile interfaces using modern design tools and principles.",
    category: "Design",
    duration: "7h 40m",
    students: 9450,
    rating: 4.8,
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop",
    instructor: "Lisa Anderson",
    lessons: 38,
  },
];
