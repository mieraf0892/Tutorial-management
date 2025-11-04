import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface TutorialCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  students: number;
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
  rating,
  level,
  image,
}: TutorialCardProps) => {
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

  return (
    <Link to={`/tutorial/${id}`}>
      <Card className="h-full overflow-hidden hover-lift hover-glow cursor-pointer group">
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
        
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>
          <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {description}
          </p>
        </CardContent>
        
        <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{students.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 font-medium text-primary">
            <Star className="h-4 w-4 fill-primary" />
            <span>{rating}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default TutorialCard;
