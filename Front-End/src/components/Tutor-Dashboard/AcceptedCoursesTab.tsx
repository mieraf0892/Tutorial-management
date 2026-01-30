// components/Tutor-Dashboard/AcceptedCoursesTab.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen,
  Users,
  Clock,
  User,
  Plus,
  FileText,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface AcceptedCourse {
  course_id: number;
  course_title: string;
  course_description: string;
  duration_hours: number;
  assignment_type: 'individual' | 'class';
  student_count: number;
  student_names: string | null;
  class_title: string | null;
  batch_name: string | null;
  last_assignment_date: string;
  has_tutorials: boolean;
}

interface AcceptedCoursesData {
  courses: AcceptedCourse[];
  stats: {
    total_courses: number;
    individual_courses: number;
    class_courses: number;
    total_students: number;
  };
}

interface AcceptedCoursesTabProps {
  onCreateTutorial?: (courseId: number, courseTitle: string) => void;
}

export default function AcceptedCoursesTab({ onCreateTutorial }: AcceptedCoursesTabProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<AcceptedCoursesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingTutorialId, setCreatingTutorialId] = useState<number | null>(null);
  
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/tutor/accepted-courses");
      
      if (response.data.success) {
        setCourses(response.data);
      } else {
        throw new Error(response.data.message || "Failed to load courses");
      }
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

 const handleCreateTutorial = async (courseId: number, courseTitle: string) => {
  try {
    setCreatingTutorialId(courseId);
    
    // Call the parent callback to open dialog
    if (onCreateTutorial) {
      onCreateTutorial(courseId, courseTitle);
    } else {
      // Fallback: Show error if callback not provided
      toast({
        title: "Error",
        description: "Tutorial creation not available",
        variant: "destructive",
      });
    }
    
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to start tutorial creation",
      variant: "destructive",
    });
  } finally {
    setCreatingTutorialId(null);
  }
};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const CourseCard = ({ course }: { course: AcceptedCourse }) => {
    const isIndividual = course.assignment_type === 'individual';
    const hasTutorials = course.has_tutorials;

    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base line-clamp-1">
                {course.course_title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="w-3 h-3" />
                <span>{course.duration_hours} hours</span>
                <span className="text-xs">•</span>
                <Badge variant="outline" className="capitalize text-xs">
                  {isIndividual ? 'Individual' : 'Class'}
                </Badge>
                {hasTutorials && (
                  <>
                    <span className="text-xs">•</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Has Tutorials
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.course_description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3" />
                <div>
                  <span className="font-medium">{course.student_count}</span>
                  <span className="text-muted-foreground"> student(s)</span>
                </div>
              </div>
              {isIndividual && course.student_names && (
                <div className="flex items-start gap-2">
                  <User className="w-3 h-3 mt-0.5" />
                  <div className="text-xs">
                    <span className="text-muted-foreground">Students: </span>
                    <span className="line-clamp-1">{course.student_names}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <div className="text-xs text-muted-foreground">
                  Assigned: {formatDate(course.last_assignment_date)}
                </div>
              </div>
              
              {course.class_title && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Class: </span>
                  <span>{course.class_title}</span>
                  {course.batch_name && (
                    <span className="text-muted-foreground"> • {course.batch_name}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
  size="sm"
  onClick={() => handleCreateTutorial(course.course_id, course.course_title)}
  disabled={creatingTutorialId === course.course_id}
  className="flex-1"
>
  {creatingTutorialId === course.course_id ? (
    <>Creating...</>
  ) : (
    <>
      <Plus className="w-4 h-4 mr-2" />
      {course.has_tutorials ? 'Manage Tutorial' : 'Create Tutorial'}
    </>
  )}
</Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // View course details
                toast({
                  title: course.course_title,
                  description: (
                    <div className="space-y-2">
                      <p><strong>Description:</strong> {course.course_description}</p>
                      <p><strong>Duration:</strong> {course.duration_hours} hours</p>
                      <p><strong>Students:</strong> {course.student_count}</p>
                      {course.student_names && (
                        <p><strong>Student Names:</strong> {course.student_names}</p>
                      )}
                    </div>
                  ),
                  duration: 8000,
                });
              }}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
        <div className="text-muted-foreground">Loading courses...</div>
      </div>
    );
  }

  if (!courses || courses.courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Accepted Courses</h3>
        <p className="text-muted-foreground text-center mb-4">
          You haven't accepted any course assignments yet.
          <br />
          Check your "My Assignments" tab for pending requests.
        </p>
        <Button onClick={() => navigate("/tutor/dashboard?tab=assignments")}>
          <ChevronRight className="w-4 h-4 mr-2" />
          Go to My Assignments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Courses</h2>
          <p className="text-muted-foreground">
            Create and manage tutorials for your accepted courses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchCourses}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{courses.stats.total_courses}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Individual</p>
                <p className="text-2xl font-bold">{courses.stats.individual_courses}</p>
              </div>
              <User className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Classes</p>
                <p className="text-2xl font-bold">{courses.stats.class_courses}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{courses.stats.total_students}</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.courses.map((course) => (
          <CourseCard key={course.course_id} course={course} />
        ))}
      </div>

      {/* Empty State for No Tutorials */}
      {courses.courses.filter(c => !c.has_tutorials).length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800">Start Creating Tutorials</h4>
                <p className="text-sm text-yellow-700">
                  You have {courses.courses.filter(c => !c.has_tutorials).length} course(s) without tutorials.
                  Click "Create Tutorial" to start building content for your students.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}