import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Users,
  Star,
  PlayCircle,
  BookOpen,
  CheckCircle2,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  order: number;
  video_url: string | null;
  content: string | null;
  is_preview: boolean;
  is_locked: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface UserProgress {
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
}

interface TutorialDetail {
  id: number;
  title: string;
  description: string;
  category: Category;
  duration: string;
  students: number;
  rating: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  image: string;
  instructor: string;
  instructor_bio: string;
  instructor_experience: string;
  lessons: Lesson[];
  total_lessons: number;
  price: number;
  is_published: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  learning_objectives: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  includes: any;
  user_progress: UserProgress | null;
  is_enrolled: boolean;
}

// Safe data conversion functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeArray = (data: any): string[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeString = (data: any, fallback: string = ''): string => {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  return String(data);
};

const TutorialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tutorial, setTutorial] = useState<TutorialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Fetch tutorial details
  const fetchTutorialDetail = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching tutorial with ID:', id);
      
      const response = await apiClient.get(`/tutorials/${id}`);
      const data = response.data;
      
      console.log('📦 API response data:', data);
      
      if (data.success && data.tutorial) {
        console.log('✅ Tutorial data received:', data.tutorial);
        setTutorial(data.tutorial);
      } else {
        throw new Error(data.message || 'Failed to fetch tutorial');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('❌ Error fetching tutorial:', error);
      
      // Handle different error types
      if (error.response?.data) {
        toast({
          title: "Error",
          description: error.response.data.message || "Failed to load tutorial details",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Network Error",
          description: "Cannot connect to server",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTutorialDetail();
    }
  }, [id]);

  // Debug: Log tutorial data when it changes
  useEffect(() => {
    if (tutorial) {
      console.log('🎯 Current tutorial state:', tutorial);
      console.log('📚 Learning objectives:', tutorial.learning_objectives);
      console.log('📦 Includes:', tutorial.includes);
    }
  }, [tutorial]);

  const handleStartLearning = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this tutorial",
        variant: "destructive"
      });
      navigate('/login', { state: { returnUrl: `/tutorials/${id}` } });
      return;
    }

    if (!tutorial?.is_enrolled) {
      handleEnroll();
      return;
    }

    // Navigate to first available lesson
    const firstAvailableLesson = tutorial.lessons?.find(lesson => 
      !lesson.is_locked || lesson.is_preview
    );
    
    if (firstAvailableLesson) {
      navigate(`/tutorials/${id}/lessons/${firstAvailableLesson.id}`);
    } else {
      toast({
        title: "No lessons available",
        description: "All lessons are currently locked",
        variant: "destructive"
      });
    }
  };

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { returnUrl: `/tutorials/${id}` } });
        return;
      }

      const response = await apiClient.post(`/tutorials/${id}/enroll`);
      const data = response.data;

      if (data.success) {
        toast({
          title: "Success!",
          description: "Successfully enrolled in the tutorial",
        });
        // Refresh tutorial data to update enrollment status
        fetchTutorialDetail();
      } else {
        throw new Error(data.message || 'Failed to enroll');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error enrolling:', error);
      
      // Handle different error types
      if (error.response?.data) {
        toast({
          title: "Error",
          description: error.response.data.message || "Failed to enroll in tutorial",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Network Error",
          description: "Cannot connect to server",
          variant: "destructive"
        });
      }
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.is_locked && !lesson.is_preview) {
      toast({
        title: "Lesson Locked",
        description: "Please complete previous lessons first",
        variant: "destructive"
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this lesson",
        variant: "destructive"
      });
      navigate('/login', { state: { returnUrl: `/tutorials/${id}/lessons/${lesson.id}` } });
      return;
    }

    if (!tutorial?.is_enrolled) {
      toast({
        title: "Enrollment Required",
        description: "Please enroll in this tutorial first",
        variant: "destructive"
      });
      return;
    }

    navigate(`/tutorials/${id}/lessons/${lesson.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg">Loading tutorial...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Tutorial Not Found</h1>
            <p className="text-muted-foreground mb-4">Tutorial with ID {id} was not found.</p>
            <Button asChild>
              <Link to="/tutorials">Browse Tutorials</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Safe data conversion - this is crucial!
  const learningObjectives = safeArray(tutorial.learning_objectives);
  const includes = safeArray(tutorial.includes);
  const lessons = Array.isArray(tutorial.lessons) ? tutorial.lessons : [];
  const categoryName = tutorial.category?.name || 'Uncategorized';
  const instructorBio = safeString(tutorial.instructor_bio, 'Expert instructor with years of experience');
  const instructorExperience = safeString(tutorial.instructor_experience, '10+ years experience');

  console.log('🛡️ Safe data - Learning objectives:', learningObjectives);
  console.log('🛡️ Safe data - Includes:', includes);
  console.log('🛡️ Safe data - Lessons count:', lessons.length);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-gradient-soft py-8 border-b">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/tutorials">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tutorials
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline">{categoryName}</Badge>
                <Badge>{tutorial.level}</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {tutorial.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {tutorial.description}
              </p>
            </div>

            <div className="rounded-xl overflow-hidden border shadow-elegant">
              <img
                src={tutorial.image}
                alt={tutorial.title}
                className="w-full aspect-video object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 py-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{tutorial.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {tutorial.students.toLocaleString()} students
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary fill-primary" />
                <span className="font-medium">{tutorial.rating} rating</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{tutorial.total_lessons} lessons</span>
              </div>
            </div>

            {/* What You'll Learn Section - SAFE */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {learningObjectives.length > 0 ? (
                    learningObjectives.map((objective, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{objective}</span>
                      </div>
                    ))
                  ) : (
                    // Fallback content
                    <>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>Core concepts and fundamentals</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>Hands-on practical projects</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>Industry best practices</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>Real-world applications</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course Content Section - SAFE */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Course Content</h2>
                <div className="space-y-3">
                  {lessons.length > 0 ? (
                    lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          (lesson.is_locked && !lesson.is_preview) || !isAuthenticated || !tutorial.is_enrolled
                            ? 'opacity-60 cursor-not-allowed'
                            : 'cursor-pointer hover:border-primary'
                        }`}
                        onClick={() => handleLessonClick(lesson)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            (lesson.is_locked && !lesson.is_preview) || !isAuthenticated || !tutorial.is_enrolled
                              ? 'bg-muted' 
                              : 'bg-primary/10'
                          }`}>
                            {(lesson.is_locked && !lesson.is_preview) || !isAuthenticated || !tutorial.is_enrolled ? (
                              <Lock className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <PlayCircle className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {lesson.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {lesson.duration}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.is_preview && (
                            <Badge variant="secondary">Preview</Badge>
                          )}
                          {(lesson.is_locked && !lesson.is_preview) && (
                            <Badge variant="outline">Locked</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No lessons available for this tutorial yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructor Section - SAFE */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                    {tutorial.instructor?.charAt(0) || 'I'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {tutorial.instructor || 'Instructor'}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      {instructorExperience}
                    </p>
                    <p className="text-sm">
                      {instructorBio}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Progress Section - Only show if enrolled */}
                  {tutorial.is_enrolled && tutorial.user_progress && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Course Progress
                      </div>
                      <Progress 
                        value={tutorial.user_progress.progress_percentage} 
                        className="mb-2" 
                      />
                      <div className="text-sm text-muted-foreground">
                        {Math.round(tutorial.user_progress.progress_percentage)}% Complete
                        ({tutorial.user_progress.completed_lessons}/{tutorial.user_progress.total_lessons} lessons)
                      </div>
                    </div>
                  )}

                  <Button
                    size="lg"
                    variant="default"
                    className="w-full"
                    onClick={handleStartLearning}
                    disabled={!tutorial.is_published}
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    {!isAuthenticated 
                      ? "Login to Enroll" 
                      : tutorial.is_enrolled 
                        ? "Continue Learning" 
                        : tutorial.price > 0 
                          ? `Enroll Now - $${tutorial.price}`
                          : "Enroll for Free"}
                  </Button>

                  {!tutorial.is_published && (
                    <div className="text-sm text-destructive text-center">
                      This tutorial is not currently available
                    </div>
                  )}

                  {/* Includes Section - SAFE */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Includes
                      </span>
                    </div>
                    <div className="space-y-2">
                      {includes.length > 0 ? (
                        includes.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <span>{item}</span>
                          </div>
                        ))
                      ) : (
                        // Fallback content
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <span>Lifetime access</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <span>Certificate of completion</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <span>Downloadable resources</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <span>Q&A support</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Add to Favorites
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TutorialDetail;