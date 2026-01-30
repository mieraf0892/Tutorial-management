// src/pages/CourseDetail.tsx
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock, Users, BookOpen, ArrowLeft, GraduationCap, AlertCircle, Lock, Eye,
  ChevronDown, ChevronUp, PlayCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface Tutor {
  id: number;
  name: string;
  email: string;
}

interface Lesson {
  id: number;
  title: string;
  description?: string;
  duration: string;
  order: number;
  is_preview: boolean;
}

interface Tutorial {
  id: number;
  title: string;
  description: string;
  status: string;
  lessons_count?: number;
  students?: number;
  lessons: Lesson[]; // only preview for non-enrolled, all for enrolled
}

interface Course {
  id: number;
  title: string;
  description: string;
  duration_hours: number;
  price_group: string | number;
  price_individual: string | number;
  is_active: boolean;
  category?: { name: string };
  tutors: Tutor[];
  tutorials?: Tutorial[];
  is_enrolled?: boolean;
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTutorials, setExpandedTutorials] = useState<number[]>([]);

  useEffect(() => {
    if (!id) return;
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/courses/${id}`);
      if (res.data.success && res.data.data) {
        setCourse(res.data.data);
      } else {
        throw new Error("Course not found");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTutorial = (tutorialId: number) => {
    setExpandedTutorials(prev =>
      prev.includes(tutorialId)
        ? prev.filter(id => id !== tutorialId)
        : [...prev, tutorialId]
    );
  };

  const handleEnroll = async () => {
    // TODO: Call your enrollment endpoint
    toast({ title: "Enrollment", description: "Coming soon!" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
        <Button asChild>
          <Link to="/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero / Back */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-10">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Image */}
            <div className="w-full md:w-1/3 rounded-xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
                alt={course.title}
                className="w-full aspect-video object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">
                {course.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-2xl font-bold">{course.duration_hours}h</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price (Group)</p>
                  <p className="text-2xl font-bold">{course.price_group} ETB</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price (1:1)</p>
                  <p className="text-2xl font-bold">{course.price_individual} ETB</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tutors</p>
                  <p className="text-2xl font-bold">{course.tutors?.length || 0}</p>
                </div>
              </div>

              <Button size="lg" className="w-full md:w-auto" onClick={handleEnroll}>
                {course.is_enrolled ? "Continue Learning" : "Enroll Now"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorials List */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Content Packages</h2>

        {course.tutorials && course.tutorials.length > 0 ? (
          <div className="space-y-6">
            {course.tutorials.map((tutorial) => (
              // Inside the tutorials map loop
<Card key={tutorial.id} className="overflow-hidden">
  <CardHeader className="bg-muted/40">
    <div className="flex justify-between items-start">
      <div>
        <CardTitle>{tutorial.title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {tutorial.lessons?.length || 0} lesson{tutorial.lessons?.length !== 1 ? 's' : ''}
        </p>
      </div>
      <Badge variant={tutorial.status === 'published' ? 'default' : 'secondary'}>
        {tutorial.status.charAt(0).toUpperCase() + tutorial.status.slice(1)}
      </Badge>
    </div>
  </CardHeader>

  <CardContent className="pt-6">
    <p className="mb-4 text-muted-foreground">{tutorial.description}</p>

    {/* Lessons Section */}
    {tutorial.lessons && tutorial.lessons.length > 0 ? (
      <div className="space-y-3">
        <p className="text-sm font-medium mb-2 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Lessons
        </p>
        <div className="space-y-2">
          {tutorial.lessons.map((lesson) => (
            <div
              key={lesson.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                lesson.is_preview ? 'bg-blue-50/50 border-blue-200' : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <PlayCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{lesson.title}</p>
                  <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {lesson.is_preview && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    Preview
                  </Badge>
                )}
                {/* Add click to view lesson later */}
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="text-center py-8 text-muted-foreground border-t">
        <BookOpen className="mx-auto h-10 w-10 mb-3 opacity-60" />
        <p>No lessons added yet for this content package.</p>
      </div>
    )}

    {/* Action Buttons */}
    <div className="mt-6 flex flex-wrap gap-3">
      <Button asChild variant="default">
        <Link to={`/tutorials/${tutorial.id}`}>
          View Full Content Package →
        </Link>
      </Button>
      {tutorial.lessons?.length > 0 && (
        <Button variant="outline">
          Preview Lesson
        </Button>
      )}
    </div>
  </CardContent>
</Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-xl">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No content packages yet</h3>
            <p className="text-muted-foreground">
              This course doesn't have any published tutorials yet.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetail;