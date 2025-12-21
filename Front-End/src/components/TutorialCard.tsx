import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface TutorialCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  students?: number; // Make optional
  enrollment_count?: number; // Add new field
  rating: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  image: string;
}

const TutorialCard = ({
  id,
  title,
  description,
  category,
  duration,
  students,
  enrollment_count, // New prop
  rating,
  level,
  image,
}: TutorialCardProps) => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Calculate students count - handle both old and new field names
  const studentCount = enrollment_count !== undefined 
    ? enrollment_count 
    : (students !== undefined ? students : 0);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-secondary/20 text-secondary-foreground";
      case "Intermediate":
        return "bg-accent/20 text-accent-foreground";
      case "Advanced":
        return "bg-primary/20 text-primary-foreground";
      default:
        return "bg-muted";
    }
  };

  const handleEnroll = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to tutorial detail
    e.stopPropagation(); // Stop event bubbling

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to enroll in tutorials",
        variant: "destructive"
      });
      return;
    }

    if (user?.role !== 'student') {
      toast({
        title: "Access Denied",
        description: "Only students can enroll in tutorials",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsEnrolling(true);
      
      const response = await apiClient.post(`/tutorials/${id}/enroll`);
      
      if (response.data.success) {
        toast({
          title: "Enrollment Successful!",
          description: `You are now enrolled in "${title}"`,
        });
      } else {
        throw new Error(response.data.message || 'Enrollment failed');
      }
    } catch (error: any) {
      console.error('Enrollment error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to enroll in tutorial';
      
      toast({
        title: "Enrollment Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <Card className="h-full overflow-hidden hover-lift hover-glow cursor-pointer group flex flex-col">
      <Link to={`/tutorial/${id}`} className="flex-1 flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute top-3 right-3">
            <Badge className={getLevelColor(level)}>{level}</Badge>
          </div>
        </div>
        
        <CardHeader className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>
          <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </CardHeader>
        
        <CardContent className="flex-1">
          <p className="text-muted-foreground text-sm line-clamp-2">
            {description}
          </p>
        </CardContent>
      </Link>
      
      <CardFooter className="flex flex-col gap-3 pt-0">
        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-muted-foreground w-full">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{studentCount.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 font-medium text-primary">
            <Star className="h-4 w-4 fill-primary" />
            <span>{rating}</span>
          </div>
        </div>

        {/* Enrollment Button */}
        <Button 
          onClick={handleEnroll}
          disabled={isEnrolling}
          className="w-full gap-2"
          size="sm"
        >
          <BookOpen className="h-4 w-4" />
          {isEnrolling ? "Enrolling..." : "Enroll Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TutorialCard;