// components/Student-Dashboard/ClassGrid.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, Clock, BookOpen } from "lucide-react";
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

interface ClassGridProps {
  tutorials: EnrolledTutorial[];
  onChatWithTutor?: (tutorId: number) => void;
  onTutorialClick: (tutorial: EnrolledTutorial) => void; // NEW PROP
}

export default function ClassGrid({ 
  tutorials, 
  onChatWithTutor, 
  onTutorialClick 
}: ClassGridProps) {
  const navigate = useNavigate();

  const handleCardClick = (tutorial: EnrolledTutorial, e: React.MouseEvent) => {
    // Only navigate if click is not on the button
    if (!(e.target as HTMLElement).closest('button')) {
      onTutorialClick(tutorial);
    }
  };

  const formatLastAccessed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const handleChatClick = (e: React.MouseEvent, tutorId: number) => {
    e.stopPropagation();
    if (onChatWithTutor) {
      onChatWithTutor(tutorId);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tutorials.map((tutorial) => (
        <Card 
          key={tutorial.id}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 group bg-card"
          onClick={(e) => handleCardClick(tutorial, e)}
        >
          <CardContent className="p-0">
            {/* Tutorial Image */}
            <div className="relative h-40 overflow-hidden rounded-t-lg">
              <img
                src={tutorial.image}
                alt={tutorial.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              
              {/* Progress Badge */}
              <div className="absolute top-3 right-3">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tutorial.is_completed 
                    ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400' 
                    : 'bg-primary/20 text-primary dark:text-primary-foreground'
                }`}>
                  {tutorial.is_completed ? 'Completed' : `${Math.round(tutorial.progress_percentage)}%`}
                </div>
              </div>

              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <div className="px-2 py-1 rounded-full bg-background/90 text-xs font-medium text-foreground">
                  {tutorial.category}
                </div>
              </div>
            </div>

            {/* Tutorial Info */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                {tutorial.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {tutorial.description}
              </p>

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {tutorial.completed_lessons}/{tutorial.total_lessons} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatLastAccessed(tutorial.last_accessed)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{Math.round(tutorial.progress_percentage)}%</span>
                </div>
                <Progress 
                  value={tutorial.progress_percentage} 
                  className="h-2 bg-muted"
                />
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${tutorial.progress_percentage}%`,
                    backgroundColor: tutorial.progress_percentage >= 90 
                      ? 'rgb(22 163 74)' 
                      : tutorial.progress_percentage >= 50 
                        ? 'rgb(59 130 246)'
                        : tutorial.progress_percentage >= 25
                          ? 'rgb(202 138 4)'
                          : 'rgb(75 85 99)'
                  }}
                />
              </div>

              {/* Instructor & Action */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">{tutorial.instructor}</p>
                  <p className="text-xs text-muted-foreground">Instructor</p>
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
                  {tutorial.is_completed ? 'Review' : 'Continue'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}