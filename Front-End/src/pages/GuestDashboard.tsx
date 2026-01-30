// components/Student/GuestDashboard.tsx
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  BookOpen, 
  GraduationCap, 
  Globe, 
  Code, 
  Users, 
  User, 
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GuestDashboardProps {
  paymentInfo: any;
  onPaymentInit: () => void;
  onRefresh: () => void;
  isRedirecting: boolean;
  onCourseSelect?: (courseId: string) => void;
  selectedCourseId?: string | null;
}

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  duration_hours: number;
  price_group: number | null;
  price_individual: number | null;
  is_active: boolean;
}

interface UserPreferences {
  course_type: string;
  learning_preference: 'Individual' | 'Group';
  preferred_days: string[];
  hours_per_day: number;
  learning_mode?: string;
  raw_course_type?: string;
  subcategories?: string[];
  primary_subcategory?: string;
  specific_interests?: string[];
}

export default function GuestDashboard({ 
  paymentInfo, 
  onPaymentInit, 
  onRefresh, 
  isRedirecting,
  onCourseSelect,
  selectedCourseId
}: GuestDashboardProps) {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");

// SIMPLIFY calculateTotal function - backend now handles calculation
const calculateTotal = () => {
  // Just return the amount_due from backend
  return paymentInfo?.amount_due || 0;
};

// Add this function inside the component, after other state declarations
const updateSelectedCourseInBackend = async (courseId: string) => {
  try {
    const response = await apiClient.post("/payment/select-course", {
      course_id: parseInt(courseId)
    });
    
    if (response.data.success) {
      toast({
        title: "Course Updated",
        description: "Price recalculated with selected course",
      });
      
      // Refresh payment info to get updated price
      onRefresh();
      
      return true;
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to update course selection",
      variant: "destructive",
    });
  }
  return false;
};



  // Debug logging
  useEffect(() => {
    console.log('🔍 GuestDashboard State:', {
      userPreferences,
      selectedCategory,
      selectedSubcategory,
      subcategories,
      coursesCount: courses.length,
      selectedCourseId,
      selectedCourse: selectedCourse?.title,
      totalPrice: calculateTotal()
    });
  }, [userPreferences, selectedCategory, selectedSubcategory, subcategories, courses, selectedCourseId, selectedCourse]);

  // Fetch user preferences and categories on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Get user preferences
      const prefsResponse = await apiClient.get("/student/preferences");
      if (prefsResponse.data.success) {
        const prefsData = prefsResponse.data.data;
        setUserPreferences({
          course_type: prefsData.course_type,
          learning_preference: prefsData.learning_preference,
          preferred_days: prefsData.preferred_days,
          hours_per_day: prefsData.hours_per_day,
          learning_mode: prefsData.learning_mode,
          raw_course_type: prefsData.raw_course_type,
          subcategories: prefsData.subcategories || [],
          primary_subcategory: prefsData.primary_subcategory,
          specific_interests: prefsData.specific_interests || [],
        });

        // Auto-select category
        if (prefsData.course_type) {
          const categoryMap: Record<string, string> = {
            'programming': 'programming',
            'school-grades': 'school-grades',
            'languages': 'languages',
            'entrance-exams': 'entrance-exams',
          };
          const uiCategory = categoryMap[prefsData.course_type] || prefsData.course_type;
          setSelectedCategory(uiCategory);

          if (prefsData.primary_subcategory) {
            setSelectedSubcategory(prefsData.primary_subcategory);
          }
        }
      }

      // 2. Get categories
      const categoriesResponse = await apiClient.get("/categories");
      if (categoriesResponse.data.success) {
        const catData = categoriesResponse.data.categories || [];
        const categorySlugs = catData.map((cat: any) => cat.slug);
        setCategories(categorySlugs);
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses when filters change
  useEffect(() => {
    if (selectedCategory) fetchCourses();
  }, [selectedCategory, selectedSubcategory]);

  // Add a useEffect to auto-select course if paymentInfo has selected_course
useEffect(() => {
  if (paymentInfo?.selected_course && courses.length > 0) {
    const course = courses.find(c => c.id === paymentInfo.selected_course.id);
    if (course) {
      setSelectedCourse(course);
      if (onCourseSelect) onCourseSelect(course.id.toString());
    }
  }
}, [paymentInfo, courses]);

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        is_active: 'true'
      });
      
      if (selectedSubcategory !== "all") {
        params.append('subcategory', selectedSubcategory);
      }

      const response = await apiClient.get(`/admin/courses?${params.toString()}`);
      if (response.data.success) {
        const coursesData = response.data.data.data || response.data.data || [];
        setCourses(coursesData);

        // Extract unique subcategories
        const uniqueSubs = [...new Set(
          coursesData
            .map((c: Course) => c.subcategory)
            .filter(Boolean)
        )] as string[];
        setSubcategories(uniqueSubs);

        // Auto-select course if we have selectedCourseId
        if (selectedCourseId) {
          const course = coursesData.find((c: Course) => c.id.toString() === selectedCourseId);
          if (course) setSelectedCourse(course);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory("all");
    setSelectedCourse(null);
    if (onCourseSelect) onCourseSelect("");
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setSelectedCourse(null);
    if (onCourseSelect) onCourseSelect("");
  };

const handleCourseSelect = async (course: Course) => {
  console.log("Course selected:", course.id, course.title);
  setSelectedCourse(course);
  if (onCourseSelect) {
    onCourseSelect(course.id.toString());
  }

  // Update backend with selected course
  const success = await updateSelectedCourseInBackend(course.id.toString());
  
  if (success && onCourseSelect) {
    onCourseSelect(course.id.toString());
  }
  
  // Don't show separate toast here - updateSelectedCourseInBackend handles it
};



  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'programming': return <Code className="h-5 w-5" />;
      case 'school-grades': return <GraduationCap className="h-5 w-5" />;
      case 'languages': return <Globe className="h-5 w-5" />;
      case 'entrance-exams': return <BookOpen className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'programming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'school-grades': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'languages': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'entrance-exams': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredCourses = selectedSubcategory === "all" 
    ? courses 
    : courses.filter(course => course.subcategory === selectedSubcategory);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600 mb-4" />
        <p className="text-muted-foreground">Loading your learning journey...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Welcome to Your Learning Journey! 🎓
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Browse available courses and choose what you want to learn. 
            After selecting a course, complete your enrollment.
          </p>

          {userPreferences && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200 shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Your preference: <span className="font-bold capitalize">{userPreferences.raw_course_type}</span>
                {userPreferences.primary_subcategory && (
                  <> • <span className="font-bold">{userPreferences.primary_subcategory}</span></>
                )}
                {userPreferences.learning_preference && (
                  <> • <span className="font-bold">{userPreferences.learning_preference}</span></>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Categories & Courses */}
          <div className="lg:col-span-2 space-y-8">
            {/* Category Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Choose Your Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      className={`h-auto py-6 ${selectedCategory === cat ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => handleCategorySelect(cat)}
                    >
                      {getCategoryIcon(cat)}
                      <div className="mt-2 text-center">
                        <div className="font-semibold">{cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course List */}
            {selectedCategory && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle>
                        Available Courses in {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace('-', ' ')}
                      </CardTitle>
                    </div>

                    {subcategories.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant={selectedSubcategory === "all" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSubcategorySelect("all")}
                        >
                          All
                        </Button>
                        {subcategories.map(sub => (
                          <Button
                            key={sub}
                            variant={selectedSubcategory === sub ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSubcategorySelect(sub)}
                          >
                            {sub}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {filteredCourses.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No courses found</p>
                      <p className="mt-2">Try changing the category or subcategory filter</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCourses.map(course => (
                        <Card
                          key={course.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedCourse?.id === course.id 
                              ? 'ring-2 ring-primary border-primary shadow-md' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => handleCourseSelect(course)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                            {course.subcategory && (
                              <Badge variant="secondary" className="mt-1">
                                {course.subcategory}
                              </Badge>
                            )}
                          </CardHeader>
                          <CardContent className="pb-3">
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                              {course.description || "No description available"}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{course.duration_hours} hrs</span>
                              </div>
                              <div className="font-medium">
                                {userPreferences?.learning_preference === 'Individual' && course.price_individual
                                  ? `${course.price_individual.toLocaleString()} ETB/hr`
                                  : course.price_group
                                    ? `${course.price_group.toLocaleString()} ETB`
                                    : '—'}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-0">
                            <Button 
                              variant={selectedCourse?.id === course.id ? "default" : "outline"}
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCourseSelect(course);
                              }}
                            >
                              {selectedCourse?.id === course.id ? "Selected" : "Select Course"}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column – Selected Course + Payment */}
          <div className="space-y-6">
            {selectedCourse ? (
              <Card className="border-2 border-primary/30 shadow-lg">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Ready to Enroll
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-xl mb-2">{selectedCourse.title}</h3>
                    {selectedCourse.subcategory && (
                      <Badge variant="outline" className="mb-4">
                        {selectedCourse.subcategory}
                      </Badge>
                    )}
                  </div>

{paymentInfo?.calculation_breakdown && (
  <div className="bg-muted/40 p-5 rounded-lg space-y-4">
    <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
      Price Breakdown
    </h4>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Hourly Rate ({paymentInfo?.selected_course?.rate_type})</span>
        <span>{paymentInfo?.calculation_breakdown?.hourly_rate?.toLocaleString()} ETB/hr</span>
      </div>
      
      {paymentInfo?.calculation_breakdown?.mode_extra > 0 && (
        <div className="flex justify-between">
          <span>Home-to-Home Extra</span>
          <span>+{paymentInfo.calculation_breakdown.mode_extra.toLocaleString()} ETB/hr</span>
        </div>
      )}
      
      <div className="flex justify-between">
        <span>Effective Hourly Rate</span>
        <span>{paymentInfo?.calculation_breakdown?.rate_with_mode?.toLocaleString()} ETB/hr</span>
      </div>
      
      <div className="flex justify-between">
        <span>Monthly Hours ({paymentInfo?.summary?.weekly_hours} hrs/week × 4)</span>
        <span>{paymentInfo?.calculation_breakdown?.monthly_hours} hrs</span>
      </div>
      
      {paymentInfo?.calculation_breakdown?.premium_markup > 1 && (
        <div className="flex justify-between">
          <span>International Curriculum Premium ({((paymentInfo.calculation_breakdown.premium_markup - 1) * 100)}%)</span>
          <span>×{paymentInfo.calculation_breakdown.premium_markup}</span>
        </div>
      )}
      
      {paymentInfo?.summary?.exam_fees > 0 && (
        <div className="flex justify-between">
          <span>Exam Fees</span>
          <span>+{paymentInfo.summary.exam_fees.toLocaleString()} ETB</span>
        </div>
      )}
      
      <div className="flex justify-between font-bold text-lg border-t pt-3 mt-2">
        <span>Total Amount</span>
        <span className="text-primary text-xl">
          {calculateTotal().toLocaleString()} ETB
        </span>
      </div>
    </div>
  </div>
)}
                </CardContent>

                <CardFooter className="pt-0 px-6 pb-6">
                
<Button 
  onClick={() => {
    console.log("Payment button clicked, selectedCourse:", selectedCourse);
    onPaymentInit();
  }}
  disabled={isRedirecting || !selectedCourse}
  className="w-full h-12 text-base font-semibold"
>
  {isRedirecting ? (
    <>
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Processing...
    </>
  ) : (
    <>
      <CreditCard className="mr-2 h-5 w-5" />
      Enroll & Pay {calculateTotal().toLocaleString()} ETB
    </>
  )}
</Button>

                  <div className="text-center text-xs text-muted-foreground mt-3">
                    <ShieldCheck className="inline h-3 w-3 mr-1" />
                    Secure payment via Chapa
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <Card className="bg-gray-50/70 border-dashed border-gray-300">
                <CardHeader>
                  <CardTitle className="text-center text-gray-600">
                    Select a Course
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-10 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-60" />
                  <p className="font-medium">Choose a course from the left</p>
                  <p className="text-sm mt-2">Then click "Enroll & Pay Now"</p>
                </CardContent>
              </Card>
            )}

            {/* Optional: Keep small refresh button */}
            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRefresh}
                className="text-muted-foreground"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Status
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}