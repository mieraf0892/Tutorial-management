// src/components/Admin-Dashboard/ClassesTab.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Users,
  Calendar,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  Search,
  Filter,
  Clock,
  User,
  BookMarked,
  CheckCircle,
  XCircle,
  Link,
  Unlink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

// Types
interface Course {
  id: number;
  title: string;
  description?: string;
  duration_hours: number;
}

interface Tutor {
  id: number;
  name: string;
  email?: string;
}

interface Student {
  id: number;
  name: string;
  email?: string;
}

interface Assignment {
  id: number;
  course_id: number;
  tutor_id: number;
  student_id: number;
  class_id: number | null;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  weekly_hours: number;
  course?: Course;
  tutor?: Tutor;
  student?: Student;
}

interface Class {
  id: number;
  title: string;
  description: string;
  course_id: number;
  tutor_id: number;
  batch_name: string;
  enrollment_code: string;
  max_capacity: number;
  current_enrollment: number;
  schedule: string;
  start_date: string;
  end_date: string;
  price: string;
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  level: string;
  course?: Course;
  tutor?: Tutor;
  assignments?: Assignment[];
}

interface ClassesTabProps {
  searchQuery?: string;
}

export default function ClassesTab({ searchQuery = "" }: ClassesTabProps) {
  const { toast } = useToast();
  
  // State
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  
  // New Class Form
  const [newClass, setNewClass] = useState({
    title: "",
    description: "",
    course_id: "",
    tutor_id: "",
    batch_name: "",
    max_capacity: 10,
    schedule: "",
    start_date: "",
    end_date: "",
    price: "",
    level: "Beginner",
    assignment_ids: [] as number[]
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Selected assignments for grouping
  const [selectedAssignments, setSelectedAssignments] = useState<number[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"classes" | "assignments">("classes");

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch classes
      const classesRes = await apiClient.get("/admin/classes");
      if (classesRes.data.success) {
        setClasses(classesRes.data.data?.data ?? []);

      }
      
      // Fetch assignments (including those not in classes)
      const assignmentsRes = await apiClient.get("/admin/student-tutor-assignments?include=unassigned");
      if (assignmentsRes.data.success) {
        setAssignments(assignmentsRes.data.data || []);
      }
      
      // Fetch courses and tutors for forms
      const [coursesRes, tutorsRes] = await Promise.all([
        apiClient.get("/admin/courses"),
        apiClient.get("/admin/users?role=tutor")
      ]);
      
      if (coursesRes.data.success) {
        const coursesData = coursesRes.data.data?.data || coursesRes.data.data || [];
        setCourses(coursesData);
      }
      
      if (tutorsRes.data.success) {
        setTutors(tutorsRes.data.data || tutorsRes.data.users || []);
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  

  // Get unassigned assignments (not in any class)
  const unassignedAssignments = useMemo(() => {
    return assignments.filter(a => !a.class_id);
  }, [assignments]);

  // Get assignments grouped by tutor and course
  const groupedAssignments = useMemo(() => {
    const groups: Record<string, Assignment[]> = {};
    
    unassignedAssignments.forEach(assignment => {
      const key = `${assignment.course_id}_${assignment.tutor_id}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(assignment);
    });
    
    return Object.entries(groups).map(([key, assignments]) => {
      const [courseId, tutorId] = key.split('_');
      const course = assignments[0].course;
      const tutor = assignments[0].tutor;
      
      return {
        key,
        course_id: parseInt(courseId),
        tutor_id: parseInt(tutorId),
        course,
        tutor,
        assignments,
        student_count: assignments.length,
        can_create_class: assignments.length >= 3 // Minimum 3 students for a class
      };
    });
  }, [unassignedAssignments]);

  // Handle Create Class from Assignments
  const handleCreateClass = async () => {
    if (!newClass.title || !newClass.course_id || !newClass.tutor_id || newClass.assignment_ids.length === 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields and select assignments",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const res = await apiClient.post("/admin/classes/from-assignments", {
        ...newClass,
        course_id: parseInt(newClass.course_id),
        tutor_id: parseInt(newClass.tutor_id),
        max_capacity: parseInt(newClass.max_capacity.toString()),
        price: parseFloat(newClass.price) || 0,
        assignment_ids: newClass.assignment_ids
      });

      if (res.data.success) {
        toast({
          title: "Success",
          description: `Class created with ${newClass.assignment_ids.length} students`,
        });
        setShowCreateDialog(false);
        resetForm();
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create class",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Handle Add Student to Existing Class
  const handleAddToClass = async (classId: number, assignmentIds: number[]) => {
    try {
      const res = await apiClient.post(`/admin/classes/${classId}/add-assignments`, {
        assignment_ids: assignmentIds
      });

      if (res.data.success) {
        toast({
          title: "Success",
          description: `${assignmentIds.length} student(s) added to class`,
        });
        setSelectedAssignments([]);
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add students",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromClass = async (assignmentId: number, classId?: number) => {
    try {
        // If classId is provided, use the class-specific endpoint
        if (classId) {
            const res = await apiClient.post(`/admin/classes/${classId}/remove-assignment/${assignmentId}`);
            
            if (res.data.success) {
                toast({
                    title: "Success",
                    description: "Student removed from class",
                });
                fetchData();
            }
        } else {
            // Fallback to the old endpoint
            const res = await apiClient.put(`/admin/student-tutor-assignments/${assignmentId}/remove-from-class`);
            
            if (res.data.success) {
                toast({
                    title: "Success",
                    description: "Student removed from class",
                });
                fetchData();
            }
        }
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to remove student",
            variant: "destructive",
        });
    }
};

  const resetForm = () => {
    setNewClass({
      title: "",
      description: "",
      course_id: "",
      tutor_id: "",
      batch_name: "",
      max_capacity: 10,
      schedule: "",
      start_date: "",
      end_date: "",
      price: "",
      level: "Beginner",
      assignment_ids: []
    });
    setSelectedAssignments([]);
  };

  // Open Create Dialog with pre-selected assignments
  const openCreateDialogWithAssignments = (courseId: number, tutorId: number, assignmentIds: number[]) => {
    const group = groupedAssignments.find(g => 
      g.course_id === courseId && g.tutor_id === tutorId
    );
    
    if (group) {
      setNewClass({
        ...newClass,
        course_id: courseId.toString(),
        tutor_id: tutorId.toString(),
        title: `${group.course?.title} - ${group.tutor?.name}'s Class`,
        batch_name: `${new Date().toLocaleDateString()} Batch`,
        max_capacity: Math.max(10, assignmentIds.length),
        assignment_ids: assignmentIds
      });
      setSelectedAssignments(assignmentIds);
    }
    setShowCreateDialog(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
      case 'ongoing':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
      case 'draft':
        return 'destructive';
      case 'upcoming':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Class Management</h2>
          <p className="text-sm text-muted-foreground">
            Group assignments into classes for organized teaching
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs for Views */}
      <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Classes ({classes.length})
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Unassigned Students ({unassignedAssignments.length})
          </TabsTrigger>
        </TabsList>

        {/* Classes View */}
        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Existing Classes</CardTitle>
                <CardDescription>
                  Manage classes created from student assignments
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setViewMode("assignments")}
              >
                <Link className="mr-2 h-4 w-4" />
                View Unassigned Students
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class & Batch</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Tutor</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Loading classes...
                        </TableCell>
                      </TableRow>
                    ) : classes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">No classes yet</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setViewMode("assignments")}
                            >
                              <Link className="mr-2 h-4 w-4" />
                              Group Students into Classes
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      classes.map(cls => (
                        <TableRow key={cls.id}>
                          <TableCell>
                            <div className="font-medium">{cls.title}</div>
                            {cls.batch_name && (
                              <div className="text-sm text-muted-foreground">{cls.batch_name}</div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              Code: {cls.enrollment_code}
                            </div>
                          </TableCell>
                          <TableCell>
                            {cls.course ? (
                              <div className="font-medium">{cls.course.title}</div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {cls.tutor ? (
                              <div>
                                <div className="font-medium">{cls.tutor.name}</div>
                                {cls.tutor.email && (
                                  <div className="text-xs text-muted-foreground">
                                    {cls.tutor.email}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{cls.current_enrollment} / {cls.max_capacity}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {assignments.filter(a => a.class_id === cls.id).length} assigned
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{cls.schedule || "Not scheduled"}</div>
                            <div className="text-xs text-muted-foreground">
                              {cls.start_date && new Date(cls.start_date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(cls.status)}>
                              {cls.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // View class details
                                const classAssignments = assignments.filter(a => a.class_id === cls.id);
                                toast({
                                  title: `Class: ${cls.title}`,
                                  description: (
                                    <div className="space-y-2">
                                      <p><strong>Students:</strong> {classAssignments.length}</p>
                                      <ul className="text-sm">
                                        {classAssignments.map(a => (
                                          <li key={a.id} className="flex justify-between">
                                            <span>{a.student?.name}</span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleRemoveFromClass(a.id)}
                                              className="h-6 text-destructive"
                                            >
                                              <XCircle className="h-3 w-3" />
                                            </Button>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ),
                                  duration: 8000,
                                });
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Add more students dialog
                                const availableAssignments = unassignedAssignments.filter(
                                  a => a.course_id === cls.course_id && a.tutor_id === cls.tutor_id
                                );
                                
                                if (availableAssignments.length === 0) {
                                  toast({
                                    title: "No Available Students",
                                    description: "No unassigned students match this class's course and tutor",
                                  });
                                  return;
                                }
                                
                                toast({
                                  title: "Add Students to Class",
                                  description: (
                                    <div className="space-y-2">
                                      <p className="text-sm">Select students to add:</p>
                                      <ScrollArea className="h-40">
                                        {availableAssignments.map(a => (
                                          <div key={a.id} className="flex items-center space-x-2 py-1">
                                            <Checkbox
                                              id={`add-${a.id}`}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  handleAddToClass(cls.id, [a.id]);
                                                }
                                              }}
                                            />
                                            <label htmlFor={`add-${a.id}`} className="text-sm">
                                              {a.student?.name}
                                            </label>
                                          </div>
                                        ))}
                                      </ScrollArea>
                                    </div>
                                  ),
                                  duration: 10000,
                                });
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unassigned Students View */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Unassigned Students</CardTitle>
                <CardDescription>
                  Group students by course and tutor to create classes
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setViewMode("classes")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Classes
                </Button>
                {selectedAssignments.length > 0 && (
                  <Button
                    onClick={() => {
                      if (selectedAssignments.length === 0) return;
                      
                      // Find common course and tutor
                      const selected = assignments.filter(a => 
                        selectedAssignments.includes(a.id)
                      );
                      
                      if (selected.length === 0) return;
                      
                      const courseId = selected[0].course_id;
                      const tutorId = selected[0].tutor_id;
                      
                      // Check if all selected have same course and tutor
                      const sameCourseTutor = selected.every(a => 
                        a.course_id === courseId && a.tutor_id === tutorId
                      );
                      
                      if (!sameCourseTutor) {
                        toast({
                          title: "Cannot Group",
                          description: "Selected students must be assigned to the same course and tutor",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      openCreateDialogWithAssignments(courseId, tutorId, selectedAssignments);
                    }}
                    disabled={selectedAssignments.length < 3}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Create Class ({selectedAssignments.length} students)
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading unassigned students...</div>
              ) : groupedAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Unassigned Students</h3>
                  <p className="text-muted-foreground mb-4">
                    All students are already grouped into classes
                  </p>
                  <Button onClick={() => setViewMode("classes")}>
                    View Existing Classes
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedAssignments.map(group => (
                    <Card key={group.key}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">
                              {group.course?.title} - {group.tutor?.name}
                            </CardTitle>
                            <CardDescription>
                              {group.student_count} student(s) ready to be grouped
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const allIds = group.assignments.map(a => a.id);
                                setSelectedAssignments(allIds);
                                openCreateDialogWithAssignments(
                                  group.course_id,
                                  group.tutor_id,
                                  allIds
                                );
                              }}
                              disabled={group.student_count < 3}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Create Class with All
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-40">
                          <div className="space-y-2">
                            {group.assignments.map(assignment => (
                              <div key={assignment.id} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    checked={selectedAssignments.includes(assignment.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedAssignments([...selectedAssignments, assignment.id]);
                                      } else {
                                        setSelectedAssignments(selectedAssignments.filter(id => id !== assignment.id));
                                      }
                                    }}
                                  />
                                  <div>
                                    <div className="font-medium">{assignment.student?.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {assignment.student?.email}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{assignment.weekly_hours} hrs/week</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Class Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Class from Assignments</DialogTitle>
            <DialogDescription>
              Group {selectedAssignments.length} student(s) into a class
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class-title">Class Title *</Label>
                <Input
                  id="class-title"
                  value={newClass.title}
                  onChange={(e) => setNewClass({...newClass, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-name">Batch Name</Label>
                <Input
                  id="batch-name"
                  value={newClass.batch_name}
                  onChange={(e) => setNewClass({...newClass, batch_name: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newClass.description}
                onChange={(e) => setNewClass({...newClass, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <div className="p-2 border rounded bg-muted">
                  {courses.find(c => c.id === parseInt(newClass.course_id))?.title || "N/A"}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tutor</Label>
                <div className="p-2 border rounded bg-muted">
                  {tutors.find(t => t.id === parseInt(newClass.tutor_id))?.name || "N/A"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-capacity">Max Capacity</Label>
                <Input
                  id="max-capacity"
                  type="number"
                  min={selectedAssignments.length}
                  max="50"
                  value={newClass.max_capacity}
                  onChange={(e) => setNewClass({...newClass, max_capacity: parseInt(e.target.value) || 10})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (ETB)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newClass.price}
                  onChange={(e) => setNewClass({...newClass, price: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={newClass.level}
                  onValueChange={(value) => setNewClass({...newClass, level: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule *</Label>
              <Input
                id="schedule"
                placeholder="e.g., Mon & Wed 6-8 PM"
                value={newClass.schedule}
                onChange={(e) => setNewClass({...newClass, schedule: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newClass.start_date}
                  onChange={(e) => setNewClass({...newClass, start_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newClass.end_date}
                  onChange={(e) => setNewClass({...newClass, end_date: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Selected Students ({selectedAssignments.length})</Label>
              <ScrollArea className="h-32 border rounded p-2">
                <div className="space-y-1">
                  {assignments
                    .filter(a => selectedAssignments.includes(a.id))
                    .map(assignment => (
                      <div key={assignment.id} className="flex items-center justify-between text-sm p-1">
                        <span>{assignment.student?.name}</span>
                        <span className="text-muted-foreground">
                          {assignment.weekly_hours} hrs/week
                        </span>
                      </div>
                    ))
                  }
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateClass} disabled={creating}>
              {creating ? "Creating..." : "Create Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}