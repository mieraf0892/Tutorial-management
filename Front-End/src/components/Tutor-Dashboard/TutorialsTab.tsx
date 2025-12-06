// components/Tutor-Dashboard/TutorialsTab.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Calendar, BookOpen, Globe, EyeOff } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Tutorial {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  student_count: number;
  total_sessions: number;
  completed_sessions: number;
  created_at: string;
  is_published?: boolean; // Add this field
}

interface TutorialsTabProps {
  tutorials: Tutorial[];
  onCreateTutorial: () => void;
  onTutorialUpdate?: () => void; // Add callback for refresh
}

export default function TutorialsTab({ tutorials, onCreateTutorial, onTutorialUpdate }: TutorialsTabProps) {
  const { toast } = useToast();

  const handlePublishTutorial = async (tutorialId: number) => {
    try {
      const response = await apiClient.patch(`/tutor/tutorials/${tutorialId}/publish`);
      
      if (response.data.success) {
        toast({
          title: "Success!",
          description: "Tutorial published successfully",
        });
        // Refresh the tutorials list
        if (onTutorialUpdate) {
          onTutorialUpdate();
        }
      } else {
        throw new Error(response.data.message || "Failed to publish tutorial");
      }
    } catch (error: any) {
      console.error("Publish tutorial error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to publish tutorial",
        variant: "destructive",
      });
    }
  };

  const handleUnpublishTutorial = async (tutorialId: number) => {
    try {
      const response = await apiClient.patch(`/tutor/tutorials/${tutorialId}/unpublish`);
      
      if (response.data.success) {
        toast({
          title: "Success!",
          description: "Tutorial unpublished successfully",
        });
        // Refresh the tutorials list
        if (onTutorialUpdate) {
          onTutorialUpdate();
        }
      } else {
        throw new Error(response.data.message || "Failed to unpublish tutorial");
      }
    } catch (error: any) {
      console.error("Unpublish tutorial error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to unpublish tutorial",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">My Tutorials</h2>
          <p className="text-muted-foreground">Manage your tutorials and track student enrollment</p>
        </div>
        <Button onClick={onCreateTutorial}>
          <Plus className="w-4 h-4 mr-2" />
          Create Tutorial
        </Button>
      </div>

      {tutorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id} className="hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-foreground">{tutorial.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {tutorial.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      {tutorial.category}
                    </Badge>
                    {tutorial.is_published ? (
                      <Badge className="bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1 border-muted-foreground text-muted-foreground">
                        <EyeOff className="w-3 h-3" />
                        Draft
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{tutorial.student_count} students</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{tutorial.completed_sessions}/{tutorial.total_sessions} sessions</span>
                    </div>
                  </div>
                  
                  {/* Publish/Unpublish Buttons */}
                  <div className="flex gap-2 pt-2">
                    {tutorial.is_published ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUnpublishTutorial(tutorial.id)}
                        className="flex-1"
                      >
                        <EyeOff className="w-3 h-3 mr-1" />
                        Unpublish
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => handlePublishTutorial(tutorial.id)}
                        className="flex-1"
                      >
                        <Globe className="w-3 h-3 mr-1" />
                        Publish
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                    <span>
                      Created {new Date(tutorial.created_at).toLocaleDateString()}
                    </span>
                    <span className={tutorial.is_published ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                      {tutorial.is_published ? "Public" : "Private"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 bg-card border-border">
          <CardContent>
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tutorials yet</h3>
            <p className="text-muted-foreground mb-4">Create your first tutorial to start teaching</p>
            <Button onClick={onCreateTutorial}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Tutorial
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}