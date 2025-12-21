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
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

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
  short_description: string;
  preview_description: string;
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
  preview_lessons?: number;
  price: number;
  is_free: boolean;
  is_published: boolean;
  has_preview: boolean;
  has_access: boolean;
  has_full_access: boolean;
  preview_video_url: string | null;
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
  const { user } = useAuth();
  
  const [tutorial, setTutorial] = useState<TutorialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

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
        console.log('🔐 Access info:', {
          has_access: data.tutorial.has_access,
          has_full_access: data.tutorial.has_full_access,
          is_enrolled: data.tutorial.is_enrolled,
          is_free: data.tutorial.is_free,
          preview_lessons: data.tutorial.preview_lessons,
          total_lessons: data.tutorial.total_lessons
        });
        setTutorial(data.tutorial);
      } else {
        throw new Error(data.message || 'Failed to fetch tutorial');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('❌ Error fetching tutorial:', error);
      
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
      console.log('🎯 Current tutorial state:', {
        ...tutorial,
        lessons_count: tutorial.lessons?.length || 0,
        access_status: {
          has_access: tutorial.has_access,
          has_full_access: tutorial.has_full_access,
          is_enrolled: tutorial.is_enrolled,
          is_free: tutorial.is_free,
          preview_lessons: tutorial.preview_lessons,
          total_lessons: tutorial.total_lessons
        }
      });
    }
  }, [tutorial]);

  const handleStartLearning = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to access this tutorial",
        variant: "destructive"
      });
      navigate('/login', { state: { returnUrl: `/tutorial/${id}` } });
      return;
    }

    // If free tutorial or already has full access, start learning
    if (tutorial?.is_free || tutorial?.has_full_access) {
      const firstAvailableLesson = tutorial.lessons?.find(lesson => 
        !lesson.is_locked || lesson.is_preview
      );
      
      if (firstAvailableLesson) {
        navigate(`/tutorial/${id}/lesson/${firstAvailableLesson.id}`);
      } else {
        toast({
          title: "No lessons available",
          description: "All lessons are currently locked",
          variant: "destructive"
        });
      }
      return;
    }

    // If not enrolled, show enroll option
    if (!tutorial?.is_enrolled) {
      handleEnroll();
      return;
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      
      if (!user) {
        navigate('/login', { state: { returnUrl: `/tutorial/${id}` } });
        return;
      }

      // For free tutorials, no enrollment needed
      if (tutorial?.is_free) {
        toast({
          title: "Free Tutorial",
          description: "This tutorial is free! You can start learning immediately.",
        });
        fetchTutorialDetail(); // Refresh to update access
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
    } finally {
      setEnrolling(false);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    // If user is not logged in
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to access this lesson",
        variant: "destructive"
      });
      navigate('/login', { state: { returnUrl: `/tutorial/${id}` } });
      return;
    }

    // Check if user has access to this lesson
    const hasLessonAccess = tutorial?.has_access || 
                           (lesson.is_preview && tutorial?.has_preview);

    if (!hasLessonAccess) {
      // If it's a preview lesson but user needs to enroll for more
      if (lesson.is_preview && tutorial?.preview_lessons && 
          tutorial.lessons?.indexOf(lesson) >= (tutorial.preview_lessons || 0)) {
        toast({
          title: "Enroll to Continue",
          description: "Enroll in this tutorial to access all lessons",
          variant: "default",
          action: (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEnroll()}
            >
              Enroll Now
            </Button>
          )
        });
        return;
      }

      // General access denied
      toast({
        title: "Access Denied",
        description: "Please enroll in this tutorial to access the lessons",
        variant: "destructive"
      });
      return;
    }

    // Check if lesson is locked (for enrolled users)
    if (lesson.is_locked && !lesson.is_preview && tutorial?.is_enrolled) {
      toast({
        title: "Lesson Locked",
        description: "Please complete previous lessons first",
        variant: "destructive"
      });
      return;
    }

    // Navigate to lesson
    navigate(`/tutorial/${id}/lesson/${lesson.id}`);
  };

  const getButtonText = () => {
    if (!user) {
      return "Login to Start Learning";
    }
    
    if (tutorial?.is_free) {
      return tutorial.has_access ? "Start Learning" : "Get Free Access";
    }
    
    if (tutorial?.has_full_access) {
      return "Continue Learning";
    }
    
    if (tutorial?.is_enrolled) {
      return "Continue Learning";
    }
    
    return tutorial?.price > 0 
      ? `Enroll Now - $${tutorial.price}` 
      : "Enroll for Free";
  };

  const getButtonVariant = () => {
    if (!user || (!tutorial?.has_access && !tutorial?.is_free)) {
      return "default";
    }
    return "default";
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
              <Link to="/">Browse Tutorials</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Safe data conversion
  const learningObjectives = safeArray(tutorial.learning_objectives);
  const includes = safeArray(tutorial.includes);
  const lessons = Array.isArray(tutorial.lessons) ? tutorial.lessons : [];
  const categoryName = tutorial.category?.name || 'Uncategorized';
  const instructorBio = safeString(tutorial.instructor_bio, 'Expert instructor with years of experience');
  const instructorExperience = safeString(tutorial.instructor_experience, '10+ years experience');
  
  // Calculate preview lessons
  const previewLessonsCount = tutorial.preview_lessons || (tutorial.has_preview ? 2 : 0);
  const isPreviewMode = !tutorial.has_full_access && previewLessonsCount > 0;
  const showPreviewWarning = isPreviewMode && lessons.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-gradient-soft py-8 border-b">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Preview Mode Banner */}
            {showPreviewWarning && (
              <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                <CardContent className="p-4 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                      Preview Mode
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      You're viewing {previewLessonsCount} of {tutorial.total_lessons} lessons. 
                      {tutorial.is_free ? (
                        " This is a free tutorial - you have full access!"
                      ) : (
                        " Enroll to unlock all lessons and get full access."
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline">{categoryName}</Badge>
                <Badge>{tutorial.level}</Badge>
                {tutorial.is_free && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Free
                  </Badge>
                )}
                {isPreviewMode && (
                  <Badge variant="outline" className="border-amber-300 text-amber-700 dark:text-amber-400">
                    Preview Available
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {tutorial.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {isPreviewMode ? tutorial.preview_description : tutorial.description}
              </p>
            </div>

            {/* Preview Video (if available) */}
            {tutorial.preview_video_url && (
              <div className="rounded-xl overflow-hidden border shadow-elegant">
                <div className="aspect-video bg-black">
                  <video 
                    src={tutorial.preview_video_url}
                    controls
                    className="w-full h-full"
                    poster={tutorial.image}
                  />
                </div>
                <div className="p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Preview video - {tutorial.is_free ? 'Full tutorial is free!' : 'Enroll to watch all videos'}
                  </p>
                </div>
              </div>
            )}

            {/* Tutorial Image (fallback if no video) */}
            {!tutorial.preview_video_url && (
              <div className="rounded-xl overflow-hidden border shadow-elegant">
                <img
                  src={tutorial.image}
                  alt={tutorial.title}
                  className="w-full aspect-video object-cover"
                />
              </div>
            )}

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
                <span className="font-medium">
                  {tutorial.total_lessons} lessons
                  {isPreviewMode && ` (${previewLessonsCount} preview)`}
                </span>
              </div>
            </div>

            {/* What You'll Learn Section */}
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

            {/* Course Content Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Course Content</h2>
                  {isPreviewMode && (
                    <Badge variant="outline" className="text-amber-700 dark:text-amber-400">
                      {previewLessonsCount} of {tutorial.total_lessons} lessons preview
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-3">
                  {lessons.length > 0 ? (
                    lessons.map((lesson, index) => {
                      const isPreviewLesson = index < previewLessonsCount;
                      const hasAccessToThisLesson = tutorial.has_full_access || 
                                                   (isPreviewLesson && tutorial.has_preview);
                      
                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                            !hasAccessToThisLesson
                              ? 'opacity-60 cursor-not-allowed'
                              : 'cursor-pointer hover:border-primary'
                          }`}
                          onClick={() => hasAccessToThisLesson && handleLessonClick(lesson)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              !hasAccessToThisLesson
                                ? 'bg-muted' 
                                : 'bg-primary/10'
                            }`}>
                              {!hasAccessToThisLesson ? (
                                <Lock className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <PlayCircle className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {lesson.title}
                                {isPreviewLesson && !tutorial.has_full_access && (
                                  <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                    (Preview)
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {lesson.duration}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isPreviewLesson && !tutorial.has_full_access && (
                              <Badge variant="secondary">Preview</Badge>
                            )}
                            {!hasAccessToThisLesson && (
                              <Badge variant="outline">Locked</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No lessons available for this tutorial yet.
                    </div>
                  )}
                </div>

                {/* Enrollment CTA for preview mode */}
                {isPreviewMode && lessons.length > 0 && (
                  <div className="mt-6 p-4 border rounded-lg bg-linear-to-r from-primary/5 to-primary/10">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Want to see all {tutorial.total_lessons} lessons?</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enroll now to get full access to all lessons, exercises, and certificate.
                    </p>
                    <Button 
                      onClick={handleEnroll}
                      disabled={enrolling || !user}
                      className="w-full"
                    >
                      {enrolling ? 'Enrolling...' : 
                       !user ? 'Login to Enroll' : 
                       tutorial.is_free ? 'Get Free Access' : 
                       tutorial.price > 0 ? `Enroll Now - $${tutorial.price}` : 'Enroll for Free'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructor Section */}
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

          {/* Sidebar - Enrollment Card */}
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

                  {/* Access Status */}
                  <div className="space-y-2">
                    {tutorial.has_full_access ? (
                      <Badge className="w-full justify-center bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        ✓ Full Access Granted
                      </Badge>
                    ) : tutorial.is_free ? (
                      <Badge className="w-full justify-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        🎉 Free Tutorial
                      </Badge>
                    ) : isPreviewMode ? (
                      <Badge variant="outline" className="w-full justify-center border-amber-300 text-amber-700 dark:text-amber-400">
                        👁️ Preview Mode
                      </Badge>
                    ) : null}
                  </div>

                  <Button
                    size="lg"
                    variant={getButtonVariant()}
                    className="w-full"
                    onClick={handleStartLearning}
                    disabled={!tutorial.is_published || enrolling}
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    {enrolling ? 'Processing...' : getButtonText()}
                  </Button>

                  {!tutorial.is_published && (
                    <div className="text-sm text-destructive text-center">
                      This tutorial is not currently available
                    </div>
                  )}

                  {/* Includes Section */}
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