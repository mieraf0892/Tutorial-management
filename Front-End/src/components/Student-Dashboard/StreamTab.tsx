// components/Student-Dashboard/StreamTab.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, CheckCircle, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecentActivity {
  type: string;
  title: string;
  tutorial_name: string;
  time: string;
  description: string;
}

interface UpcomingLesson {
  tutorial_id: number;
  tutorial_title: string;
  lesson_id: number;
  lesson_title: string;
  lesson_duration: string;
  is_preview: boolean;
  due_date: string | null;
}

interface StreamTabProps {
  recentActivities: RecentActivity[];
  upcomingLessons: UpcomingLesson[];
}

export default function StreamTab({ recentActivities, upcomingLessons }: StreamTabProps) {
  const navigate = useNavigate();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />;
      case 'announcement':
        return <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - time.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.floor(diffHours)} hours ago`;
    return time.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLessonClick = (tutorialId: number, lessonId: number) => {
    navigate(`/tutorials/${tutorialId}/lessons/${lessonId}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Activities */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Recent Activity</h2>
            
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {activity.tutorial_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(activity.time)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p>No recent activity yet</p>
                <p className="text-sm">Complete some lessons to see your activity here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Lessons */}
      <div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground">Upcoming Lessons</h2>
            </div>
            
            {upcomingLessons.length > 0 ? (
              <div className="space-y-3">
                {upcomingLessons.slice(0, 5).map((lesson, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg border border-border hover:border-primary cursor-pointer transition-colors group bg-card"
                    onClick={() => handleLessonClick(lesson.tutorial_id, lesson.lesson_id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {lesson.lesson_title}
                      </h4>
                      {lesson.is_preview && (
                        <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                          Preview
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {lesson.tutorial_title}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{lesson.lesson_duration}</span>
                      <Button size="sm" variant="ghost" className="h-6 text-xs">
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm">No upcoming lessons</p>
                <p className="text-xs">Continue learning to see upcoming lessons</p>
              </div>
            )}

            {upcomingLessons.length > 5 && (
              <Button variant="outline" className="w-full mt-4">
                View All Upcoming Lessons
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}