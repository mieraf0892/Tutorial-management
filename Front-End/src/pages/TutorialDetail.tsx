// src/pages/TutorialDetail.tsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PlayCircle, BookOpen, Clock, CheckCircle2, Lock, AlertCircle,
  ArrowLeft, Video, FileText, ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface Lesson {
  id: number;
  title: string;
  description?: string;
  duration: string;
  order: number;
  video_url?: string;
  content?: string;
  is_preview: boolean;
  is_locked: boolean;
  completed?: boolean; // we'll add later with progress
}

interface Tutorial {
  id: number;
  title: string;
  description: string;
  status: string;
  duration_hours?: number;
  lessons: Lesson[];
  lessons_count: number;
  is_enrolled?: boolean;
  has_preview?: boolean;
  preview_lessons_count?: number;
}

const TutorialDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchTutorial();
  }, [id]);

  const fetchTutorial = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/tutorials/${id}`);
      if (res.data.success && res.data.tutorial) {
        setTutorial(res.data.tutorial);
      } else {
        throw new Error(res.data.message || "Tutorial not found");
      }
    } catch (err: any) {
      console.error("Tutorial fetch error:", err);
      setError(err.response?.data?.message || "Failed to load tutorial");
      toast({
        title: "Error",
        description: "Could not load tutorial details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = (lesson: Lesson) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to access lessons",
        variant: "destructive",
      });
      navigate("/login", { state: { returnUrl: `/tutorials/${id}` } });
      return;
    }

    // Check access
    const hasAccess = tutorial?.is_enrolled || lesson.is_preview;
    if (!hasAccess) {
      toast({
        title: "Locked",
        description: "Enroll in the course to unlock this lesson",
        variant: "default",
      });
      return;
    }

    // Navigate to lesson player page (to be built later)
    navigate(`/tutorials/${id}/lessons/${lesson.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !tutorial) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-4">Tutorial Not Found</h1>
        <p className="text-muted-foreground mb-8">{error || "This tutorial is not available."}</p>
        <Button asChild>
          <Link to="/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  const isEnrolled = tutorial.is_enrolled || false;
  const previewCount = tutorial.preview_lessons_count || tutorial.lessons.filter(l => l.is_preview).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-b from-primary/5 to-background py-10">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-6">
            <Link to={`/courses/${tutorial.course_id || 'back'}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Image / Video Preview */}
            <div className="w-full md:w-2/5 rounded-xl overflow-hidden shadow-xl border">
              {tutorial.lessons?.[0]?.video_url ? (
                <div className="aspect-video bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={tutorial.lessons[0].video_url.replace("watch?v=", "embed/")}
                    title={tutorial.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
                  alt={tutorial.title}
                  className="w-full aspect-video object-cover"
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="outline">Published</Badge>
                {isEnrolled && (
                  <Badge className="bg-green-600">Enrolled</Badge>
                )}
                {!isEnrolled && previewCount > 0 && (
                  <Badge variant="secondary">Preview Available ({previewCount} lessons)</Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {tutorial.title}
              </h1>

              <p className="text-xl text-muted-foreground mb-6">
                {tutorial.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <p className="text-sm text-muted-foreground">Lessons</p>
                  <p className="text-2xl font-bold">{tutorial.lessons_count || tutorial.lessons?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-2xl font-bold">{tutorial.duration_hours || "?"}h</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold">{tutorial.students || 0}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => {
                  const firstLesson = tutorial.lessons?.find(l => l.is_preview || isEnrolled);
                  if (firstLesson) {
                    handleStartLesson(firstLesson);
                  } else {
                    toast({ title: "No lessons", description: "This tutorial has no available lessons yet." });
                  }
                }}>
                  <PlayCircle className="mr-2 h-5 w-5" />
                  {isEnrolled ? "Continue Learning" : "Start Preview"}
                </Button>

                {!isEnrolled && (
                  <Button size="lg" variant="outline" onClick={() => {
                    // TODO: enroll logic
                    toast({ title: "Enrollment", description: "Coming soon!" });
                  }}>
                    Enroll Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          All Lessons
        </h2>

        {tutorial.lessons && tutorial.lessons.length > 0 ? (
          <div className="space-y-4">
            {tutorial.lessons.map((lesson) => (
              <Card
                key={lesson.id}
                className={`overflow-hidden cursor-pointer hover:shadow-md transition-all ${
                  !isEnrolled && !lesson.is_preview ? 'opacity-60' : ''
                }`}
                onClick={() => isEnrolled || lesson.is_preview ? handleStartLesson(lesson) : null}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Lesson Thumbnail / Video Preview */}
                    <div className="md:w-1/3 bg-black aspect-video relative">
                      {lesson.video_url ? (
                        <img
                          src={`https://img.youtube.com/vi/${lesson.video_url.split('v=')[1]?.split('&')[0] || ''}/hqdefault.jpg`}
                          alt={lesson.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      {(isEnrolled || lesson.is_preview) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                          <PlayCircle className="h-16 w-16 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            {lesson.order}. {lesson.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {lesson.duration}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {lesson.is_preview && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Preview
                            </Badge>
                          )}
                          {lesson.is_locked && !isEnrolled && (
                            <Badge variant="secondary">
                              <Lock className="h-3 w-3 mr-1" /> Locked
                            </Badge>
                          )}
                        </div>
                      </div>

                      {lesson.description && (
                        <p className="text-muted-foreground line-clamp-3 mb-4">
                          {lesson.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {lesson.content && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            Has notes/content
                          </div>
                        )}
                        {lesson.video_url && (
                          <div className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            Video lesson
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-xl">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-2xl font-medium mb-3">No Lessons Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This tutorial doesn't have any lessons added yet. Check back later!
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TutorialDetail;