// components/Tutor-Dashboard/StudentsTab.tsx
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
import { Search, Mail, Calendar, MessageCircle, Users } from "lucide-react";

interface Student {
  id: number;
  name: string;
  email: string;
  tutorial_id: number;
  tutorial_title: string;
  enrollment_date: string;
  progress_percentage: number;
  last_accessed: string;
}

interface Tutorial {
  id: number;
  title: string;
}

interface StudentsTabProps {
  students: Student[];
  tutorials: Tutorial[];
  onMessageStudent: (studentId: number) => void;
}

export default function StudentsTab({ students, tutorials, onMessageStudent }: StudentsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTutorial, setSelectedTutorial] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "progress" | "recent">("name");

  const filteredStudents = students
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTutorial = selectedTutorial === "all" || student.tutorial_title === selectedTutorial;
      return matchesSearch && matchesTutorial;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "progress":
          return b.progress_percentage - a.progress_percentage;
        case "recent":
          return new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime();
        default:
          return 0;
      }
    });

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400";
    if (progress >= 50) return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400";
    return "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Student Management</h2>
        <p className="text-muted-foreground">View and manage all your students across tutorials</p>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search students by name or email..."
                className="pl-10 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={selectedTutorial} onValueChange={setSelectedTutorial}>
              <SelectTrigger className="w-full md:w-[200px] bg-background">
                <SelectValue placeholder="All Tutorials" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tutorials</SelectItem>
                {tutorials.map(tutorial => (
                  <SelectItem key={tutorial.id} value={tutorial.title}>
                    {tutorial.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: "name" | "progress" | "recent") => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-[200px] bg-background">
                <SelectValue placeholder="Sort by Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="progress">Sort by Progress</SelectItem>
                <SelectItem value="recent">Sort by Recent Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-foreground">{student.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {student.email}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMessageStudent(student.id)}
                    title={`Message ${student.name}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tutorial</p>
                    <Badge variant="secondary" className="mt-1 bg-muted text-muted-foreground">
                      {student.tutorial_title}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Progress</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${student.progress_percentage}%` }}
                        ></div>
                      </div>
                      <Badge className={getProgressColor(student.progress_percentage)}>
                        {student.progress_percentage}%
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Enrolled {new Date(student.enrollment_date).toLocaleDateString()}
                    </div>
                    <div>
                      Last active {new Date(student.last_accessed).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 bg-card border-border">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No students found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedTutorial !== "all" 
                ? "Try adjusting your search filters" 
                : "Students will appear here when they enroll in your tutorials"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}