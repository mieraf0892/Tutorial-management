// components/Student-Dashboard/DashboardLessonPlayer.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  Clock,
  Lock,
  ChevronLeft,
  ChevronRight,
  Download,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

/* ============================
   Types
============================ */
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
  is_completed?: boolean;
}

interface Tutorial {
  id: number;
  title: string;
  instructor: string;
  category: { name: string };
}

interface DashboardLessonPlayerProps {
  tutorialId: string;
  onExitLearningMode: () => void;
}

/* ============================
   Helpers
============================ */
const getYoutubeEmbedUrl = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

export default function DashboardLessonPlayer({
  tutorialId,
  onExitLearningMode,
}: DashboardLessonPlayerProps) {
  const { toast } = useToast();

  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [progress, setProgress] = useState({
    completed_lessons: 0,
    total_lessons: 0,
    percentage: 0,
  });

  /* ============================
     Fetch Data
  ============================ */
  const fetchTutorialData = async (lessonId?: number) => {
    try {
      setLoading(true);

      const targetLessonId = lessonId ?? 1;
      const response = await apiClient.get(
        `/tutorials/${tutorialId}/lessons/${targetLessonId}`
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message);
      }

      setTutorial(data.tutorial);
      setLessons(data.sidebar_lessons || []);
      setCurrentLesson(data.lesson);
      setProgress(data.progress);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to load lesson",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tutorialId) fetchTutorialData();
  }, [tutorialId]);

  /* ============================
     Completion
  ============================ */
  const markAsCompleted = async () => {
    if (!currentLesson) return;

    try {
      setIsCompleting(true);
      const response = await apiClient.post(
        `/lessons/${currentLesson.id}/complete`
      );

      if (response.data.success) {
        toast({
          title: "Lesson Completed 🎉",
          description: "You can proceed to the next lesson",
        });
        fetchTutorialData(currentLesson.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to complete lesson",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  /* ============================
     Navigation
  ============================ */
  const currentIndex = lessons.findIndex(
    (l) => l.id === currentLesson?.id
  );

  const goToLesson = (lesson: Lesson) => {
    fetchTutorialData(lesson.id);
  };

  const goToNextLesson = () => {
    if (currentIndex < lessons.length - 1) {
      goToLesson(lessons[currentIndex + 1]);
    }
  };

  const goToPreviousLesson = () => {
    if (currentIndex > 0) {
      goToLesson(lessons[currentIndex - 1]);
    }
  };

  /* ============================
     Loading / Error States
  ============================ */
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tutorial || !currentLesson) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
    );
  }

  /* ============================
     Render
  ============================ */
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <Button variant="ghost" onClick={onExitLearningMode}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="font-bold">{tutorial.title}</h1>
          <p className="text-sm text-muted-foreground">
            {tutorial.instructor} • {tutorial.category?.name}
          </p>
        </div>
        <div className="w-40">
          <Progress value={progress.percentage} />
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-4 gap-6 p-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4 space-y-2">
            {lessons.map((lesson) => {
              const isCurrent = lesson.id === currentLesson.id;
              return (
                <div
                  key={lesson.id}
                  onClick={() => goToLesson(lesson)}
                  className={`p-3 rounded cursor-pointer ${
                    isCurrent
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {lesson.order}. {lesson.title}
                    </span>
                    {lesson.is_completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : lesson.is_locked ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <PlayCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Main */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <Badge>Lesson {currentLesson.order}</Badge>
            {currentLesson.is_preview && (
              <Badge variant="secondary" className="ml-2">
                Preview
              </Badge>
            )}
            <h2 className="text-2xl font-bold mt-2">
              {currentLesson.title}
            </h2>
            <p className="text-muted-foreground mt-2">
              {currentLesson.description}
            </p>
          </div>

          {/* VIDEO PLAYER (FIXED) */}
          {currentLesson.video_url ? (
            <Card>
              <div className="aspect-video bg-black">
                {currentLesson.video_url.includes("youtube") ||
                currentLesson.video_url.includes("youtu.be") ? (
                  <iframe
                    src={getYoutubeEmbedUrl(currentLesson.video_url) ?? ""}
                    title={currentLesson.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={currentLesson.video_url}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-10 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                No video for this lesson
              </CardContent>
            </Card>
          )}

          {/* Content */}
          {currentLesson.content && (
            <Card>
              <CardContent
                className="prose max-w-none p-6"
                dangerouslySetInnerHTML={{
                  __html: currentLesson.content,
                }}
              />
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              disabled={currentIndex === 0}
              onClick={goToPreviousLesson}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {!currentLesson.is_completed && (
              <Button onClick={markAsCompleted} disabled={isCompleting}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark Complete
              </Button>
            )}

            <Button
              disabled={currentIndex === lessons.length - 1}
              onClick={goToNextLesson}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
