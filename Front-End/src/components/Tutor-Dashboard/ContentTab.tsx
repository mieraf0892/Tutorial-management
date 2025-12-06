// components/Tutor-Dashboard/ContentTab.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload, FileText, Video, Search, Users, Calendar } from "lucide-react";

interface Tutorial {
  id: number;
  title: string;
  description: string;
  category: string;
  student_count: number;
}

interface ContentTabProps {
  tutorials: Tutorial[];
}

interface ContentItem {
  id: number;
  tutorial_id: number;
  title: string;
  type: "assignment" | "video" | "document" | "quiz";
  created_at: string;
  student_completions: number;
  total_students: number;
}

export default function ContentTab({ tutorials }: ContentTabProps) {
  const [selectedTutorial, setSelectedTutorial] = useState<number | "all">("all");
  const [contentType, setContentType] = useState<"all" | "assignment" | "video" | "document" | "quiz">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock content data - in real app, this would come from API
  const mockContent: ContentItem[] = [
    {
      id: 1,
      tutorial_id: 1,
      title: "Introduction to React",
      type: "video",
      created_at: "2024-01-15",
      student_completions: 12,
      total_students: 15
    },
    {
      id: 2,
      tutorial_id: 1,
      title: "Week 1 Assignment",
      type: "assignment",
      created_at: "2024-01-16",
      student_completions: 8,
      total_students: 15
    },
    {
      id: 3,
      tutorial_id: 2,
      title: "Advanced JavaScript Concepts",
      type: "document",
      created_at: "2024-01-10",
      student_completions: 10,
      total_students: 12
    }
  ];

  const filteredContent = mockContent.filter(item => {
    const matchesTutorial = selectedTutorial === "all" || item.tutorial_id === selectedTutorial;
    const matchesType = contentType === "all" || item.type === contentType;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTutorial && matchesType && matchesSearch;
  });

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case "assignment": return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case "document": return <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case "quiz": return <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default: return <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "video": return "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400";
      case "assignment": return "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400";
      case "document": return "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400";
      case "quiz": return "bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-400";
      default: return "bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-400";
    }
  };

  const getStatCardColor = (type: string) => {
    switch (type) {
      case "file": return "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400";
      case "video": return "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400";
      case "assignment": return "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400";
      case "users": return "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400";
      default: return "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400";
    }
  };

  const handleUploadContent = () => {
    // In real app, this would open an upload dialog
    console.log("Upload new content");
  };

  const handleCreateAssignment = () => {
    // In real app, this would open an assignment creation form
    console.log("Create new assignment");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Content Management</h2>
          <p className="text-muted-foreground">Upload and manage learning materials for your tutorials</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCreateAssignment}>
            <Plus className="w-4 h-4 mr-2" />
            New Assignment
          </Button>
          <Button onClick={handleUploadContent}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Content
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search content..."
                className="pl-10 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select 
              value={selectedTutorial.toString()} 
              onValueChange={(value) => setSelectedTutorial(value === "all" ? "all" : parseInt(value))}
            >
              <SelectTrigger className="w-full md:w-[200px] bg-background">
                <SelectValue placeholder="All Tutorials" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tutorials</SelectItem>
                {tutorials.map(tutorial => (
                  <SelectItem key={tutorial.id} value={tutorial.id.toString()}>
                    {tutorial.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={contentType} 
              onValueChange={(value: "all" | "assignment" | "video" | "document" | "quiz") => setContentType(value)}
            >
              <SelectTrigger className="w-full md:w-[200px] bg-background">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="assignment">Assignments</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="quiz">Quizzes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      {filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => {
            const tutorial = tutorials.find(t => t.id === item.tutorial_id);
            const completionRate = (item.student_completions / item.total_students) * 100;
            
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getContentIcon(item.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-foreground">{item.title}</CardTitle>
                        <CardDescription className="text-muted-foreground">{tutorial?.title}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getContentTypeColor(item.type)}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Student Progress</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {item.student_completions}/{item.total_students}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {Math.round(completionRate)}% completed
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        View Submissions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12 bg-card border-border">
          <CardContent>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No content found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedTutorial !== "all" || contentType !== "all"
                ? "Try adjusting your search filters" 
                : "Upload your first piece of content to get started"}
            </p>
            <Button onClick={handleUploadContent}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Content
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Content</p>
                <p className="text-2xl font-bold text-foreground">{mockContent.length}</p>
              </div>
              <div className={`p-2 rounded-lg ${getStatCardColor("file")}`}>
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Videos</p>
                <p className="text-2xl font-bold text-foreground">
                  {mockContent.filter(c => c.type === 'video').length}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${getStatCardColor("video")}`}>
                <Video className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assignments</p>
                <p className="text-2xl font-bold text-foreground">
                  {mockContent.filter(c => c.type === 'assignment').length}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${getStatCardColor("assignment")}`}>
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(mockContent.reduce((sum, item) => sum + (item.student_completions / item.total_students), 0) / mockContent.length * 100)}%
                </p>
              </div>
              <div className={`p-2 rounded-lg ${getStatCardColor("users")}`}>
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}