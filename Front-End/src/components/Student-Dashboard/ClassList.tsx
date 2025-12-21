// components/Student-Dashboard/ClassList.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, BookOpen, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EnrolledTutorial {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  instructor: string;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  last_accessed: string;
  is_completed: boolean;
  tutor_id: number;
  tutor_name: string;
}

interface ClassListProps {
  tutorials: EnrolledTutorial[];
  onChatWithTutor?: (tutorId: number) => void;
  onTutorialClick: (tutorial: EnrolledTutorial) => void; // NEW PROP
}

export default function ClassList({ 
  tutorials, 
  onChatWithTutor,
  onTutorialClick 
}: ClassListProps) {
  const navigate = useNavigate();

  const handleCardClick = (tutorial: EnrolledTutorial, e: React.MouseEvent) => {
    // Only navigate if click is not on the button
    if (!(e.target as HTMLElement).closest('button')) {
      onTutorialClick(tutorial);
    }
  };

  const formatLastAccessed = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusText = (tutorial: EnrolledTutorial) => {
    if (tutorial.is_completed) return "Completed";
    if (tutorial.progress_percentage > 0) return "In Progress";
    return "Not Started";
  };

  const getStatusColor = (tutorial: EnrolledTutorial) => {
    if (tutorial.is_completed) return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20";
    if (tutorial.progress_percentage > 0) return "text-primary bg-primary/20";
    return "text-muted-foreground bg-muted";
  };

  const handleChatClick = (e: React.MouseEvent, tutorId: number) => {
    e.stopPropagation();
    if (onChatWithTutor) {
      onChatWithTutor(tutorId);
    }
  };

  return (
    <div className="space-y-4">
      {tutorials.map((tutorial) => (
        <Card 
          key={tutorial.id}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-card"
          onClick={(e) => handleCardClick(tutorial, e)}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Tutorial Image */}
              <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-border">
                <img
                  src={tutorial.image}
                  alt={tutorial.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Tutorial Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-foreground hover:text-primary transition-colors">
                      {tutorial.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {tutorial.description}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tutorial)}`}>
                    {getStatusText(tutorial)}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {tutorial.completed_lessons}/{tutorial.total_lessons} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatLastAccessed(tutorial.last_accessed)}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {tutorial.category}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{Math.round(tutorial.progress_percentage)}%</span>
                  </div>
                  <Progress value={tutorial.progress_percentage} className="h-2 bg-muted" />
                </div>

                {/* Instructor & Actions */}
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Instructor</p>
                    <p className="font-medium text-foreground">{tutorial.instructor}</p>
                    {tutorial.tutor_id && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 mt-1 text-xs"
                        onClick={(e) => handleChatClick(e, tutorial.tutor_id)}
                      >
                        Message Tutor
                      </Button>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTutorialClick(tutorial);
                    }}
                  >
                    <PlayCircle className="w-4 h-4" />
                    {tutorial.is_completed ? 'Review' : 'Continue Learning'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}