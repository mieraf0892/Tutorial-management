import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Palette, TrendingUp, Database, Smartphone, Globe, GraduationCap, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

// Icon mapping for backend icons
const iconMap = {
  'code': Code,
  'palette': Palette,
  'trending-up': TrendingUp,
  'database': Database,
  'smartphone': Smartphone,
  'globe': Globe,
  'graduation-cap': GraduationCap,
  'code-2': Code,
  'book-open': BookOpen,
};

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  tutorial_count: number;
  is_active: boolean;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/categories');
        const data = response.data;

        if (data.success) {
          setCategories(data.categories);
        } else {
          throw new Error(data.message || 'Failed to fetch categories');
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        
        // Handle different error types
        if (error.response?.data) {
          toast({
            title: "Error",
            description: error.response.data.message || "Failed to load categories",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Network Error",
            description: "Cannot connect to server",
            variant: "destructive"
          });
        }
        
        // Fallback to empty array
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading categories...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-gradient-soft py-16 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse by Category</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore tutorials across various disciplines and find the perfect course for your learning journey
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Code;
              
              return (
                <Link
                  key={category.id}
                  to={`/tutorials?category=${category.name}`}
                  className="group"
                >
                  <Card className="h-full hover-lift hover-glow cursor-pointer overflow-hidden">
                    <CardContent className="p-6">
                      <div className={`h-16 w-16 rounded-xl bg-linear-to-br ${category.color} flex items-center justify-center mb-4 shadow-lg`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {category.tutorial_count} tutorials available
                      </p>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="text-sm text-primary font-medium">
                        Explore →
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              No categories available at the moment
            </p>
            <p className="text-sm text-muted-foreground">
              Please check back later or contact support.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Categories;