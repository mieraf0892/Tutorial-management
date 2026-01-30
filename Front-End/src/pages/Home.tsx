import { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TutorialCard from "@/components/TutorialCard";
import TutorialCardSkeleton from "@/components/TutorialCardSkeleton";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Code, 
  Palette, 
  TrendingUp, 
  Database, 
  ArrowRight, 
  Sparkles, 
  Clock,
  Users,
  Star,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { motion } from "framer-motion";
import CourseCard from "@/components/CourseCard";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  tutorial_count: number;
  icon_name: string;
}

// 1. Change state & interface
interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  duration_hours?: number;
  price_group?: string | number;
  price_individual?: string | number;
  students?: number;
  rating?: number;
  image?: string;
  is_featured?: boolean;
}

interface HomepageStats {
  total_students: number;
  total_courses: number;
  total_tutorials: number;
}

interface Instructor {
  id: number;
  name: string;
  avatar?: string;
  title?: string;
}

interface Tutorial {
  id: number;
  title: string;
  description: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  duration: string;
  students: number;
  rating: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  image: string;
  instructor: Instructor;
  lessons: number;
  price: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  tutorials?: T[];
  categories?: T[];
}

const STATIC_CATEGORIES = [
  { 
    name: "Web Development", 
    icon: Code, 
    slug: "web-development",
    description: "Learn modern web technologies and frameworks"
  },
  { 
    name: "Design", 
    icon: Palette, 
    slug: "design",
    description: "Master UI/UX design and creative tools"
  },
  { 
    name: "Marketing", 
    icon: TrendingUp, 
    slug: "marketing",
    description: "Grow your business with digital marketing"
  },
  { 
    name: "Data Science", 
    icon: Database, 
    slug: "data-science",
    description: "Analyze data and build machine learning models"
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const Home = () => {
  const [featuredTutorials, setFeaturedTutorials] = useState<Tutorial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<HomepageStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState({
    tutorials: true,
    categories: true
  });
  const [error, setError] = useState<{
    tutorials: string | null;
    categories: string | null;
  }>({
    tutorials: null,
    categories: null
  });
  const navigate = useNavigate();

  // Fetch homepage stats
  useEffect(() => {
    const fetchHomepageStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        
        const response = await apiClient.get<{
          success: boolean;
          data: HomepageStats;
          message?: string;
        }>('/homepage-stats');
        
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setStatsError(response.data.message || 'Failed to load statistics');
        }
      } catch (error) {
        console.error('Error fetching homepage stats:', error);
        setStatsError('Could not load statistics. Please try again later.');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchHomepageStats();
  }, []);

  const fetchFeaturedCourses = async () => {
  try {
    setLoading(prev => ({ ...prev, tutorials: true })); // rename to courses later
    let response = await apiClient.get('/courses', {
      params: { featured: true, limit: 6 }
    });

    // Adjust based on your actual response structure
    const courses = response.data.success 
      ? (response.data.courses || response.data.data || [])
      : [];

    setFeaturedCourses(courses.slice(0, 6));
  } catch (error) {
    console.error('Error fetching courses:', error);
    setFeaturedCourses([]);
  } finally {
    setLoading(prev => ({ ...prev, tutorials: false }));
  }
};

  // Memoized tutorial transformation
  const transformTutorialData = useCallback((tutorial: Tutorial) => ({
    id: tutorial.id.toString(),
    title: tutorial.title,
    description: tutorial.description,
    category: tutorial.category.name,
    duration: tutorial.duration,
    students: tutorial.students,
    rating: tutorial.rating,
    level: tutorial.level,
    image: tutorial.image,
    instructor: tutorial.instructor.name,
    instructorAvatar: tutorial.instructor.avatar,
    instructorTitle: tutorial.instructor.title,
    lessons: tutorial.lessons,
    price: tutorial.price,
    is_featured: tutorial.is_featured,
    createdAt: tutorial.created_at,
  }), []);

  // Fetch tutorials with fallback to different endpoints
  useEffect(() => {
    const fetchFeaturedTutorials = async () => {
      try {
        setLoading(prev => ({ ...prev, tutorials: true }));
        setError(prev => ({ ...prev, tutorials: null }));
        
        // Try different endpoints in order
        let response;
        
        try {
          // Try the specific featured endpoint first
          response = await apiClient.get<ApiResponse<Tutorial[]>>('/tutorials/featured');
        } catch (featuredError) {
          // If featured endpoint fails, try regular tutorials with featured filter
          console.log('Featured endpoint not found, trying regular tutorials...');
          response = await apiClient.get<ApiResponse<Tutorial[]>>('/tutorials', {
            params: {
              featured: true,
              limit: 6,
              include: 'instructor,category'
            }
          });
        }
        
        // Handle different response structures
        let tutorials: Tutorial[] = [];
        
        if (response.data.success) {
          if (response.data.data) {
            tutorials = Array.isArray(response.data.data) 
              ? response.data.data 
              : [response.data.data];
          } else if (response.data.tutorials) {
            tutorials = Array.isArray(response.data.tutorials) 
              ? response.data.tutorials 
              : [response.data.tutorials];
          }
          
          // If we got more than 6, slice it
          if (tutorials.length > 6) {
            tutorials = tutorials.slice(0, 6);
          }
          
          setFeaturedTutorials(tutorials);
        } else {
          // No fallback data - just log and set empty array
          console.log('No featured tutorials found in API response');
          setFeaturedTutorials([]);
        }
      } catch (error) {
        console.error('Error fetching tutorials:', error);
        // No fallback data - empty array on error
        setFeaturedTutorials([]);
        setError(prev => ({
          ...prev,
          tutorials: 'Could not load featured tutorials.'
        }));
      } finally {
        setLoading(prev => ({ ...prev, tutorials: false }));
      }
    };

    fetchFeaturedTutorials();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(prev => ({ ...prev, categories: true }));
        setError(prev => ({ ...prev, categories: null }));
        
        let response;
        try {
          response = await apiClient.get<ApiResponse<Category[]>>('/categories');
        } catch (categoriesError) {
          console.log('Categories endpoint not found');
          setCategories([]);
          return;
        }
        
        let categoriesData: Category[] = [];
        
        if (response.data.success) {
          if (response.data.data) {
            categoriesData = Array.isArray(response.data.data) 
              ? response.data.data 
              : [response.data.data];
          } else if (response.data.categories) {
            categoriesData = Array.isArray(response.data.categories) 
              ? response.data.categories 
              : [response.data.categories];
          }
          setCategories(categoriesData);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };

    fetchCategories();
  }, []);

  // Memoized categories to display
  const displayCategories = useMemo(() => {
    return categories.length > 0 
      ? categories.slice(0, 4).map(cat => {
          const staticCat = STATIC_CATEGORIES.find(sc => sc.name === cat.name);
          return {
            ...cat,
            icon: staticCat?.icon || Database,
            description: staticCat?.description || `Learn about ${cat.name}`
          };
        })
      : STATIC_CATEGORIES.map((cat, index) => ({
          id: index + 1,
          name: cat.name,
          slug: cat.slug,
          tutorial_count: 0, // Changed from random number to 0
          description: cat.description,
          icon: cat.icon
        }));
  }, [categories]);

  // Handle category click
  const handleCategoryClick = useCallback((slug: string) => {
    navigate(`/tutorials?category=${slug}`);
  }, [navigate]);

  // Handle tutorial click
  const handleTutorialClick = useCallback((id: string) => {
    navigate(`/tutorials/${id}`);
  }, [navigate]);

  // Render tutorial skeletons
  const renderTutorialSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <TutorialCardSkeleton key={index} />
      ))}
    </div>
  );

  // Render category skeletons
  const renderCategorySkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="p-6 rounded-xl border bg-card animate-pulse">
          <div className="h-12 w-12 rounded-lg bg-muted mb-4"></div>
          <div className="h-6 bg-muted rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />

      {/* Categories Section */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            <Sparkles className="h-4 w-4" />
            Popular Categories
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Popular Categories
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose from thousands of tutorials across various disciplines. Start learning today!
          </p>
        </motion.div>

        {loading.categories ? (
          renderCategorySkeletons()
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {displayCategories.map((category) => {
              const Icon = category.icon || Database;
              return (
                <motion.div
                  key={category.id}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
                  className="group relative"
                >
                  <button
                    onClick={() => handleCategoryClick(category.slug)}
                    className="w-full p-6 rounded-xl border bg-card hover:shadow-xl hover:border-primary/20 cursor-pointer transition-all duration-300 text-left"
                    aria-label={`Browse ${category.name} tutorials`}
                  >
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-all duration-300">
                      <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-medium text-primary">
                        {category.tutorial_count.toLocaleString()} tutorials
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {error.categories && !loading.categories && (
          <div className="text-center mt-8 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-yellow-700">{error.categories}</p>
          </div>
        )}
      </section>

      {/* Featured Tutorials Section */}
      <section className="py-20 bg-linear-to-b from-background via-muted/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12"
          >
            <div className="mb-6 md:mb-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
                <Star className="h-4 w-4" />
                Featured
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Featured Tutorials
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Hand-picked tutorials from industry experts. Start learning with our most popular courses.
              </p>
            </div>
            <Button 
              variant="outline" 
              asChild 
              className="hidden md:flex group"
              size="lg"
            >
              <Link to="/tutorials">
                View All Tutorials
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          {loading.tutorials ? (
            renderTutorialSkeletons()
          ) : (
            <>
              {error.tutorials && (
                <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="text-yellow-700 text-sm">{error.tutorials}</p>
                </div>
              )}
              
              <motion.div
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-50px" }}
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
>
  {featuredCourses.map((course) => (
    <motion.div
      key={course.id}
      variants={itemVariants}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <CourseCard 
        id={course.id}
        title={course.title}
        description={course.description}
        category={course.category}
        duration_hours={course.duration_hours}
        price_group={course.price_group}
        price_individual={course.price_individual}
        students={course.students}
        rating={course.rating}
        image={course.image}
      />
    </motion.div>
  ))}
</motion.div>
              ) : (
                <div className="text-center py-12 rounded-xl border bg-card">
                  <p className="text-muted-foreground mb-4">No featured tutorials available.</p>
                  <Button asChild>
                    <Link to="/courses">View All Courses</Link>
                  </Button>
                </div>
              
            </>
          )}

          <div className="text-center mt-12 md:hidden">
            <Button variant="outline" asChild size="lg">
              <Link to="/tutorials">
                View All Tutorials
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20"
          >
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-6 rounded-xl border bg-card animate-pulse">
                    <div className="h-12 w-12 rounded-lg bg-muted mb-4 mx-auto"></div>
                    <div className="h-8 bg-muted rounded mb-2 w-1/2 mx-auto"></div>
                    <div className="h-4 bg-muted rounded w-1/3 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl border bg-card text-center">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {stats.total_students.toLocaleString()}+
                  </div>
                  <p className="text-muted-foreground">Active Students</p>
                </div>
                <div className="p-6 rounded-xl border bg-card text-center">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {stats.total_courses}+
                  </div>
                  <p className="text-muted-foreground">Available Courses</p>
                </div>
                <div className="p-6 rounded-xl border bg-card text-center">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {stats.total_tutorials}+
                  </div>
                  <p className="text-muted-foreground">Published Tutorials</p>
                </div>
              </div>
            )}
            
            {statsError && (
              <div className="text-center mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-yellow-700 text-sm">{statsError}</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-primary/80 p-12 md:p-16 text-center"
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.1%22%3E%3Cpath%20d=%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
            }}
          />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of students already learning on TutorialHub. Start your journey today with our free courses!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="shadow-xl hover:shadow-2xl transition-shadow group"
              >
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/courses">
                  Browse Courses
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;