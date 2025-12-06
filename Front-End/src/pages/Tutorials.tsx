import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TutorialCard from "@/components/TutorialCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth"; 
import { apiClient } from "@/lib/api";

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
  instructor: string;
  lessons: number;
  price: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  tutorial_count: number;
}

const Tutorials = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, isAuthenticated, initializeAuth } = useAuth(); // Add this line
  const navigate = useNavigate(); // Add this import

  useEffect(() => {
    console.log('🔄 Tutorials page - Initializing auth...');
    initializeAuth();
  }, [initializeAuth]);
  
  // State for data and filters
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize from URL parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || 'all');

  // Fetch tutorials from backend
  const fetchTutorials = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedLevel !== "all") params.set("level", selectedLevel);

      const { data } = await apiClient.get(`/tutorials?${params.toString()}`);

      if (data.success) {
        setTutorials(data.tutorials);
      } else {
        throw new Error(data.message || "Failed to load tutorials");
      }
      } catch (error) {
        console.error("Error loading tutorials:", error);
      toast({
        title: "Error",
        description: "Failed to load tutorials",
        variant: "destructive",
      });
      } finally {
        setLoading(false);
      }
    };


  // Fetch categories and levels
    const fetchFilters = async () => {
    try {
      const [categoriesResponse, levelsResponse] = await Promise.all([
        apiClient.get("/tutorials/categories/list"),
        apiClient.get("/tutorials/levels/list"),
      ]);

      if (categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.categories);
      }

      if (levelsResponse.data.success) {
        setLevels(["all", ...levelsResponse.data.levels]);
      }
      } catch (error) {
        console.error("Error loading filters:", error);
        setLevels(["all", "Beginner", "Intermediate", "Advanced"]);
      }
    };


  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedLevel !== 'all') params.set('level', selectedLevel);
    
    setSearchParams(params);
  }, [searchTerm, selectedCategory, selectedLevel, setSearchParams]);

  // Fetch data when component mounts or filters change
  useEffect(() => {
    fetchFilters();
  }, []);
  
  // Add this useEffect to handle non-student users
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'student') {
      toast({
        title: "Access Restricted",
        description: "Only students can browse and enroll in tutorials",
        variant: "destructive"
      });
      navigate('/'); // Redirect to home or their dashboard
    }
  }, [isAuthenticated, user, navigate, toast]);
  
  // ... rest of your existing code

  useEffect(() => {
    fetchTutorials();
  }, [searchTerm, selectedCategory, selectedLevel]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLevel("all");
  };

  // Transform backend data to match TutorialCard props
  const transformTutorialData = (tutorial: Tutorial) => ({
    id: tutorial.id.toString(),
    title: tutorial.title,
    description: tutorial.description,
    category: tutorial.category.name,
    duration: tutorial.duration,
    students: tutorial.students, // Real student count from database
    rating: tutorial.rating, // Real rating from database
    level: tutorial.level,
    image: tutorial.image,
    instructor: tutorial.instructor,
    lessons: tutorial.lessons, // Real lesson count from database
    content: '', // Optional field
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-gradient-soft py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Tutorials</h1>
          <p className="text-muted-foreground text-lg">
            Discover {tutorials.length} expert-led tutorials
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Section */}
        <div className="bg-card rounded-xl border p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name} ({category.tutorial_count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Level Filter */}
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
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

          {/* Active Filters Display */}
          {(searchTerm || selectedCategory !== "all" || selectedLevel !== "all") && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {tutorials.length} tutorial
                {tutorials.length !== 1 ? "s" : ""}
                {searchTerm && ` for "${searchTerm}"`}
                {selectedCategory !== "all" && ` in ${selectedCategory}`}
                {selectedLevel !== "all" && ` at ${selectedLevel} level`}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Tutorials Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="text-lg">Loading tutorials...</div>
          </div>
        ) : tutorials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => (
              <TutorialCard 
                key={tutorial.id} 
                {...transformTutorialData(tutorial)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              No tutorials found matching your criteria
            </p>
            <Button
              variant="outline"
              onClick={clearAllFilters}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Tutorials;