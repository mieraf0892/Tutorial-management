// src/pages/Courses.tsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

// Interfaces (adjusted to match your backend)
interface Category {
  id: number;
  name: string;
  slug: string;
  course_count?: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  duration_hours?: number;
  price_group?: string | number;
  price_individual?: string | number;
  students?: number;
  rating?: number;
  image?: string;
  level?: string;
  lessons_count?: number;
  is_published?: boolean;
  created_at: string;
}

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get("level") || "all");

  // Data
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels] = useState<string[]>(["all", "Beginner", "Intermediate", "Advanced"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/courses'); // your endpoint

      console.log('Full API Response:', res.data); // keep this for debugging

      let courseList: Course[] = [];

      if (res.data?.success) {
        // Laravel paginated response → nested "data.data"
        if (res.data.data && Array.isArray(res.data.data.data)) {
          courseList = res.data.data.data;
        }
        // Fallbacks in case response changes later
        else if (Array.isArray(res.data.data)) {
          courseList = res.data.data;
        } else if (Array.isArray(res.data.courses)) {
          courseList = res.data.courses;
        } else if (Array.isArray(res.data)) {
          courseList = res.data;
        }
      }

      console.log('Extracted courses:', courseList); // DEBUG: should show array

      setCourses(courseList);
    } catch (err: any) {
      console.error('Courses fetch error:', err);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  fetchCourses();
}, []);

  // Fetch categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get("/categories"); // adjust endpoint if needed
        if (res.data.success) {
          setCategories(res.data.categories || res.data.data || []);
        }
      } catch (err) {
        console.error("Categories fetch error:", err);
      }
    };
    fetchCategories();
  }, []);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedLevel !== "all") params.set("level", selectedLevel);
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedCategory, selectedLevel]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLevel("all");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-12 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover high-quality courses taught by expert tutors. Start learning today!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 flex-1">
        {/* Filters */}
        <div className="bg-card rounded-xl border shadow-sm p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug || cat.name}>
                    {cat.name} {cat.course_count ? `(${cat.course_count})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level === "all" ? "All Levels" : level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || selectedCategory !== "all" || selectedLevel !== "all") && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Showing {courses.length} course{courses.length !== 1 ? "s" : ""}
              </span>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-96 bg-muted/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 border rounded-xl bg-muted/30">
            <h3 className="text-xl font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search term
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                category={course.category?.name || "Uncategorized"}
                duration_hours={course.duration_hours}
                price_group={course.price_group}
                price_individual={course.price_individual}
                students={course.students || 0}
                rating={course.rating || 0}
                image={course.image}
                level={course.level}
                lessons={course.lessons_count || 0}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Courses;