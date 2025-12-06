// components/Student-Dashboard/WorkTab.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, AlertCircle, CheckCircle, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpcomingLesson {
  tutorial_id: number;
  tutorial_title: string;
  lesson_id: number;
  lesson_title: string;
  lesson_duration: string;
  is_preview: boolean;
  due_date: string | null;
}

interface Stats {
  total_enrolled: number;
  completed_tutorials: number;
  in_progress_tutorials: number;
  total_lessons_completed: number;
}

interface WorkTabProps {
  upcomingLessons: UpcomingLesson[];
  stats: Stats;
}

export default function WorkTab({ upcomingLessons, stats }: WorkTabProps) {
  const navigate = useNavigate();

  const handleLessonClick = (tutorialId: number, lessonId: number) => {
    navigate(`/tutorials/${tutorialId}/lessons/${lessonId}`);
  };

  const getDueStatus = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20' };
    if (diffDays <= 3) return { text: `Due in ${diffDays} days`, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/20' };
    return { text: `Due in ${diffDays} days`, color: 'text-muted-foreground bg-muted' };
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return 'No due date';
    return new Date(dueDate).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const completionRate = stats.total_enrolled > 0 
    ? (stats.completed_tutorials / stats.total_enrolled) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* To-do List */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">To-do List</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span>{upcomingLessons.length} items</span>
              </div>
            </div>

            {upcomingLessons.length > 0 ? (
              <div className="space-y-4">
                {upcomingLessons.map((lesson, index) => {
                  const dueStatus = getDueStatus(lesson.due_date);
                  
                  return (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary cursor-pointer transition-colors group bg-card"
                      onClick={() => handleLessonClick(lesson.tutorial_id, lesson.lesson_id)}
                    >
                      <div className="shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <PlayCircle className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {lesson.lesson_title}
                          </h4>
                          {dueStatus && (
                            <span className={`px-2 py-1 text-xs rounded-full ${dueStatus.color}`}>
                              {dueStatus.text}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                          {lesson.tutorial_title}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.lesson_duration}
                          </span>
                          <span>
                            {formatDueDate(lesson.due_date)}
                          </span>
                          {lesson.is_preview && (
                            <span className="text-primary font-medium">Preview Available</span>
                          )}
                        </div>
                      </div>
                      
                      <Button size="sm" className="gap-2">
                        <PlayCircle className="w-4 h-4" />
                        Start
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
                <p className="text-sm">You don't have any upcoming lessons right now.</p>
                <Button className="mt-4" onClick={() => navigate('/tutorials')}>
                  Browse Tutorials
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="space-y-6">
        {/* Completion Stats */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-foreground">Progress Overview</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Course Completion</span>
                  <span className="font-medium text-foreground">{Math.round(completionRate)}%</span>
                </div>
                <Progress value={completionRate} className="h-2 bg-muted" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-500/20">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed_tutorials}</div>
                  <div className="text-xs text-green-800 dark:text-green-300">Completed</div>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <div className="text-2xl font-bold text-primary">{stats.in_progress_tutorials}</div>
                  <div className="text-xs text-primary-background">In Progress</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-foreground">Quick Actions</h3>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3"
                onClick={() => navigate('/tutorials')}
              >
                <PlayCircle className="w-4 h-4" />
                Continue Learning
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3"
                onClick={() => navigate('/tutorials')}
              >
                <Calendar className="w-4 h-4" />
                Browse Tutorials
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3"
                onClick={() => navigate('/profile')}
              >
                <CheckCircle className="w-4 h-4" />
                View Achievements
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}