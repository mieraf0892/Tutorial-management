import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { tutorialsData } from "@/data/tutorials";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Users,
  Star,
  PlayCircle,
  BookOpen,
  Award,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

const TutorialDetail = () => {
  const { id } = useParams();
  const tutorial = tutorialsData.find((t) => t.id === id);

  if (!tutorial) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Tutorial Not Found</h1>
            <Button asChild>
              <Link to="/tutorials">Browse Tutorials</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-gradient-soft py-8 border-b">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/tutorials">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tutorials
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline">{tutorial.category}</Badge>
                <Badge>{tutorial.level}</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {tutorial.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {tutorial.description}
              </p>
            </div>

            <div className="rounded-xl overflow-hidden border shadow-elegant">
              <img
                src={tutorial.image}
                alt={tutorial.title}
                className="w-full aspect-video object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 py-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{tutorial.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {tutorial.students.toLocaleString()} students
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary fill-primary" />
                <span className="font-medium">{tutorial.rating} rating</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{tutorial.lessons} lessons</span>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Core concepts and fundamentals",
                    "Hands-on practical projects",
                    "Industry best practices",
                    "Real-world applications",
                    "Advanced techniques and tips",
                    "Problem-solving strategies",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Course Content</h2>
                <div className="space-y-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <PlayCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Lesson {i + 1}: Introduction to Core Concepts
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.floor(Math.random() * 20) + 5} min
                          </div>
                        </div>
                      </div>
                      {i === 0 && (
                        <Badge variant="secondary">Preview</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                    {tutorial.instructor?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {tutorial.instructor}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Expert Instructor • 10+ years experience
                    </p>
                    <p className="text-sm">
                      Passionate educator helping thousands of students achieve
                      their learning goals through practical, real-world
                      projects and expert guidance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Course Progress
                    </div>
                    <Progress value={0} className="mb-2" />
                    <div className="text-sm text-muted-foreground">
                      0% Complete
                    </div>
                  </div>

                  <Button
                    size="lg"
                    variant="default"
                    className="w-full"
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Start Learning
                  </Button>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Includes
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{tutorial.duration} on-demand video</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{tutorial.lessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Lifetime access</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Add to Favorites
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TutorialDetail;
