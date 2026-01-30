// src/components/Admin-Dashboard/AssignmentsTab.tsx
import { useState, useEffect } from "react";
import { 
  UserCheck, 
  Users, 
  BookOpen, 
  Clock, 
  Trash2,
  Plus,
  Search,
  Filter
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";

// Types
interface Course {
  id: number;
  title: string;
  description?: string;
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

interface StudentTutorAssignment {
  id: number;
  course_id: number;
  tutor_id: number;
  student_id: number;
  status: 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  weekly_hours: number;
  course?: Course;
  tutor?: Tutor;
  student?: Student;
}

export default function AssignmentsTab() {
  const { toast } = useToast();
  
  // State for Assignments
  const [assignments, setAssignments] = useState<StudentTutorAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for Forms
  const [courses, setCourses] = useState<Course[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // New Assignment Form
  const [newAssignment, setNewAssignment] = useState({
    course_id: "",
    tutor_id: "",
    student_ids: [] as number[],
    weekly_hours: 2,
    start_date: new Date().toISOString().split('T')[0]
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Assignments
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/student-tutor-assignments");
      if (res.data.success) {
        setAssignments(res.data.data || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Form Data
  const fetchFormData = async () => {
    try {
      // Fetch courses
      const coursesRes = await apiClient.get("/admin/courses");
      if (coursesRes.data.success) {
        const coursesData = coursesRes.data.data?.data || coursesRes.data.data || [];
        setCourses(coursesData);
      }

      // Fetch tutors
      const tutorsRes = await apiClient.get("/admin/users?role=tutor");
      if (tutorsRes.data.success) {
        setTutors(tutorsRes.data.data || tutorsRes.data.users || []);
      }

      // Fetch students
      const studentsRes = await apiClient.get("/admin/users?role=student");
      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data || studentsRes.data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch form data:", error);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchFormData();
  }, []);

  // Filtered Assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
    
    const matchesSearch = searchQuery ? 
      assignment.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.tutor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    
    return matchesStatus && matchesSearch;
  });

  // Handle Create Assignment
  const handleCreateAssignment = async () => {
    if (!newAssignment.course_id || !newAssignment.tutor_id || newAssignment.student_ids.length === 0) {
      toast({
        title: "Error",
        description: "Please select course, tutor, and at least one student",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const res = await apiClient.post("/admin/student-tutor-assignments", {
        ...newAssignment,
        course_id: parseInt(newAssignment.course_id),
        tutor_id: parseInt(newAssignment.tutor_id),
        student_ids: newAssignment.student_ids
      });

      if (res.data.success) {
        toast({
          title: "Success",
          description: `${newAssignment.student_ids.length} assignment(s) created successfully`,
        });
        setShowCreateDialog(false);
        resetForm();
        fetchAssignments();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create assignments",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Handle Delete Assignment
  const handleDeleteAssignment = async (id: number) => {
    if (!confirm("Are you sure you want to remove this assignment?")) return;

    try {
      await apiClient.delete(`/admin/student-tutor-assignments/${id}`);
      toast({
        title: "Success",
        description: "Assignment removed successfully",
      });
      fetchAssignments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove assignment",
        variant: "destructive",
      });
    }
  };

  // Reset Form
  const resetForm = () => {
    setNewAssignment({
      course_id: "",
      tutor_id: "",
      student_ids: [],
      weekly_hours: 2,
      start_date: new Date().toISOString().split('T')[0]
    });
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Student-Tutor Assignments</h2>
          <p className="text-sm text-muted-foreground">
            Assign individual students to tutors for specific courses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAssignments}>
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
                <DialogDescription>
                  Assign one or more students to a tutor for a specific course.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignment-course">Course *</Label>
                    <Select
                      value={newAssignment.course_id}
                      onValueChange={(value) => setNewAssignment({...newAssignment, course_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignment-tutor">Tutor *</Label>
                    <Select
                      value={newAssignment.tutor_id}
                      onValueChange={(value) => setNewAssignment({...newAssignment, tutor_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tutor" />
                      </SelectTrigger>
                      <SelectContent>
                        {tutors.map(tutor => (
                          <SelectItem key={tutor.id} value={tutor.id.toString()}>
                            {tutor.name} {tutor.email && `(${tutor.email})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekly-hours">Weekly Hours</Label>
                  <Input
                    id="weekly-hours"
                    type="number"
                    min="1"
                    max="20"
                    value={newAssignment.weekly_hours}
                    onChange={(e) => setNewAssignment({
                      ...newAssignment, 
                      weekly_hours: parseInt(e.target.value) || 2
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newAssignment.start_date}
                    onChange={(e) => setNewAssignment({...newAssignment, start_date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Select Students *</Label>
                  <ScrollArea className="h-[200px] border rounded-md p-2">
                    <div className="space-y-2">
                      {students.map(student => (
                        <div key={student.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`student-${student.id}`}
                            checked={newAssignment.student_ids.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewAssignment({
                                  ...newAssignment,
                                  student_ids: [...newAssignment.student_ids, student.id]
                                });
                              } else {
                                setNewAssignment({
                                  ...newAssignment,
                                  student_ids: newAssignment.student_ids.filter(id => id !== student.id)
                                });
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label htmlFor={`student-${student.id}`} className="text-sm cursor-pointer">
                            <div className="font-medium">{student.name}</div>
                            {student.email && (
                              <div className="text-xs text-muted-foreground">{student.email}</div>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="text-sm text-muted-foreground">
                    Selected: {newAssignment.student_ids.length} student(s)
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateAssignment} 
                  disabled={creating || newAssignment.student_ids.length === 0}
                >
                  {creating ? "Creating..." : "Create Assignment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <Label htmlFor="search" className="mb-1.5 block text-sm">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by course, tutor, or student..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter by Status
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Hours/Week</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading assignments...
                </TableCell>
              </TableRow>
            ) : filteredAssignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 py-6">
                    <UserCheck className="h-10 w-10 text-muted-foreground" />
                    <p className="text-lg font-medium">No assignments found</p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || statusFilter !== "all"
                        ? "Try changing filters or search"
                        : "Get started by creating your first assignment"}
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)} className="mt-2">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Assignment
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAssignments.map(assignment => (
                <TableRow key={assignment.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium">
                      {assignment.course?.title || `Course #${assignment.course_id}`}
                    </div>
                    {assignment.course?.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {assignment.course.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {assignment.tutor?.name || `Tutor #${assignment.tutor_id}`}
                    </div>
                    {assignment.tutor?.email && (
                      <div className="text-sm text-muted-foreground">
                        {assignment.tutor.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {assignment.student?.name || `Student #${assignment.student_id}`}
                    </div>
                    {assignment.student?.email && (
                      <div className="text-sm text-muted-foreground">
                        {assignment.student.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{assignment.weekly_hours} hrs/week</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.start_date).toLocaleDateString()}
                    {assignment.end_date && (
                      <div className="text-xs text-muted-foreground">
                        End: {new Date(assignment.end_date).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(assignment.status)}>
                      {assignment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats Summary */}
      {filteredAssignments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold">{filteredAssignments.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {filteredAssignments.filter(a => a.status === 'active').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Hours/Week</p>
                <p className="text-2xl font-bold">
                  {filteredAssignments.length > 0
                    ? (filteredAssignments.reduce((sum, a) => sum + a.weekly_hours, 0) / filteredAssignments.length).toFixed(1)
                    : '0.0'} hrs
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}