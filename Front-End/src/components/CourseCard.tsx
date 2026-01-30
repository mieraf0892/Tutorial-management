// src/components/CourseCard.tsx
import { Link } from "react-router-dom";
import { BookOpen, Users, Clock, Star } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Course {
  id: string | number;
  title: string;
  description: string;
  category: string;
  duration_hours?: number;
  price_group?: string | number;
  price_individual?: string | number;
  students?: number;
  rating?: number;
  image?: string;
  is_featured?: boolean;
}

export default function CourseCard({
  id,
  title,
  description,
  category,
  duration_hours,
  price_group,
  price_individual,
  students = 0,
  rating = 0,
  image = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
}: Course) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {rating > 0 && (
          <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {rating.toFixed(1)}
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
        <Badge variant="secondary" className="mt-2 w-fit">
          {category}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {description}
        </p>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {duration_hours && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {duration_hours} hrs
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {students.toLocaleString()} students
          </div>
        </div>

        {(price_group || price_individual) && (
          <div className="mt-4 pt-4 border-t">
            {price_group && (
              <p className="text-sm">
                <span className="font-medium">Group:</span> {price_group} ETB
              </p>
            )}
            {price_individual && (
              <p className="text-sm">
                <span className="font-medium">1:1:</span> {price_individual} ETB
              </p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 border-t">
        <Button variant="outline" className="w-full" asChild>
          <Link to={`/courses/${id}`}>
            View Course
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}