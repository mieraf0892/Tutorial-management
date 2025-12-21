import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Download,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  RefreshCw,
  BookOpen,
  Clock,
  User,
  BookCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  avatar_url?: string;
  enrolled_date: string;
  enrollment_date: string; // Alias for enrolled_date
  status: "active" | "inactive" | "pending" | "completed";
  progress: number;
  progress_percentage: number; // Alias for progress
  completed_courses: number;
  total_courses: number;
  last_accessed: string;
  last_active: string; // Alias for last_accessed
  tutorial_id?: number;
  tutorial_title?: string;
  tutorials?: Tutorial[];
}

interface Tutorial {
  id: number;
  title: string;
  progress?: number;
  grade?: string;
  enrolled_date?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  students?: T[];
  dashboard?: {
    recent_students?: T[];
  };
}

const StudentsTab = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Student>("enrollment_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch students from backend - using the tutor/students endpoint
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      // Use the tutor/students endpoint
      const response = await apiClient.get<ApiResponse<Student[]>>('/tutor/students');
      
      if (response.data.success) {
        let studentsData: Student[] = [];
        
        // Handle different response structures
        if (response.data.data) {
          studentsData = Array.isArray(response.data.data) 
            ? response.data.data 
            : [response.data.data];
        } else if (response.data.students) {
          studentsData = Array.isArray(response.data.students) 
            ? response.data.students 
            : [response.data.students];
        } else if (response.data.dashboard?.recent_students) {
          studentsData = response.data.dashboard.recent_students;
        }
        
        // Transform the data to match our interface
        const transformedStudents = studentsData.map(student => {
          // Use enrollment_date if available, otherwise use enrolled_date
          const enrollmentDate = student.enrollment_date || student.enrolled_date || new Date().toISOString().split('T')[0];
          
          // Use progress_percentage if available, otherwise use progress
          const progress = student.progress_percentage || student.progress || 0;
          
          // Use last_accessed if available, otherwise use last_active
          const lastActive = student.last_accessed || student.last_active || 'Recently';
          
          // Default to active status if not provided
          const status = student.status || 'active';
          
          // Get tutorial info if available
          const tutorialTitle = student.tutorial_title || 'Not enrolled in tutorials';
          
          return {
            ...student,
            id: student.id || 0,
            name: student.name || 'Unknown Student',
            email: student.email || '',
            avatar: student.avatar_url || student.avatar,
            enrolled_date: enrollmentDate,
            enrollment_date: enrollmentDate,
            status: status as Student['status'],
            progress: progress,
            progress_percentage: progress,
            completed_courses: student.completed_courses || 0,
            total_courses: student.total_courses || 0,
            last_accessed: lastActive,
            last_active: lastActive,
            tutorial_id: student.tutorial_id,
            tutorial_title: tutorialTitle,
            tutorials: student.tutorials || []
          };
        });
        
        setStudents(transformedStudents);
        toast.success(`Loaded ${transformedStudents.length} students`);
      } else {
        toast.error(response.data.message || 'Failed to load students');
      }
    } catch (error: any) {
      console.error('Error fetching students:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load students';
      toast.error(errorMessage);
      
      // Fallback to empty array
      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter and sort students
  useEffect(() => {
    let result = [...students];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        (student.phone && student.phone.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(student => student.status === statusFilter);
    }

    // Tab filter
    if (activeTab !== "all") {
      result = result.filter(student => student.status === activeTab);
    }

    // Sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortField === 'enrollment_date' || sortField === 'enrolled_date') {
        const dateA = new Date(a.enrollment_date || a.enrolled_date || '').getTime();
        const dateB = new Date(b.enrollment_date || b.enrolled_date || '').getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      return 0;
    });

    setFilteredStudents(result);
  }, [students, searchQuery, statusFilter, sortField, sortDirection, activeTab]);

  const handleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    try {
      if (filteredStudents.length === 0) {
        toast.error('No students to export');
        return;
      }

      // Prepare data for export
      const exportData = filteredStudents.map(student => ({
        Name: student.name,
        Email: student.email,
        Phone: student.phone || 'N/A',
        Status: student.status,
        Progress: `${student.progress}%`,
        'Enrolled Date': formatEnrolledDate(student.enrollment_date || student.enrolled_date || ''),
        'Completed Courses': student.completed_courses,
        'Total Courses': student.total_courses,
        'Last Active': student.last_accessed || student.last_active || 'N/A',
        'Current Tutorial': student.tutorial_title || 'N/A'
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0]).join(',');
      const rows = exportData.map(obj => Object.values(obj).map(v => 
        typeof v === 'string' && v.includes(',') ? `"${v}"` : v
      ).join(','));
      const csv = [headers, ...rows].join('\n');

      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${filteredStudents.length} students to CSV`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export students');
    }
  };

  const getStatusBadge = (status: Student['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-600">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return "bg-green-500";
    if (progress >= 40) return "bg-blue-500";
    return "bg-yellow-500";
  };

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => s.status === 'active').length;
    const inactive = students.filter(s => s.status === 'inactive').length;
    const pending = students.filter(s => s.status === 'pending').length;
    const completed = students.filter(s => s.status === 'completed').length;
    const averageProgress = students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + (s.progress || 0), 0) / students.length)
      : 0;

    return { total, active, inactive, pending, completed, averageProgress };
  }, [students]);

  const handleRefresh = () => {
    fetchStudents();
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error('No phone number available');
    }
  };

  const formatEnrolledDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const renderStudentRow = (student: Student) => {
    const enrollmentDate = student.enrollment_date || student.enrolled_date;
    const lastActive = student.last_accessed || student.last_active;
    
    return (
      <TableRow key={student.id} className="hover:bg-muted/50">
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage 
                src={student.avatar} 
                alt={student.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`;
                }}
              />
              <AvatarFallback>
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-muted-foreground">{student.email}</p>
              {student.phone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {student.phone}
                </p>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell>
          {getStatusBadge(student.status)}
        </TableCell>
        <TableCell>
          <div className="space-y-2">
            <Progress 
              value={student.progress} 
              className={`h-2 ${getProgressColor(student.progress)}`}
            />
            <p className="text-sm font-medium">{student.progress}%</p>
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm">
            <p>{formatEnrolledDate(enrollmentDate || '')}</p>
            <p className="text-muted-foreground">
              {enrollmentDate ? getTimeAgo(enrollmentDate) : 'N/A'}
            </p>
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm">
            <p className="font-medium">{student.completed_courses}/{student.total_courses}</p>
            <p className="text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              courses
            </p>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleViewStudent(student)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSendEmail(student.email)}>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              {student.phone && (
                <DropdownMenuItem onClick={() => handleCall(student.phone)}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call Student
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Student
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students Management</h2>
          <p className="text-muted-foreground">
            Manage your students, track progress, and monitor engagement
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="gap-2"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleExport} 
            variant="outline" 
            className="gap-2"
            disabled={filteredStudents.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Progress</p>
                <p className="text-2xl font-bold">{stats.averageProgress}%</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BookCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search students by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
              <TabsTrigger value="inactive">Inactive ({stats.inactive})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
          <CardDescription>
            Showing {filteredStudents.length} of {students.length} students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-24 w-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No students found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search or filter" : "No students enrolled yet"}
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("name")}
                        className="font-semibold p-0 hover:bg-transparent hover:text-primary"
                      >
                        Student
                        {sortField === "name" && (
                          <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("status")}
                        className="font-semibold p-0 hover:bg-transparent hover:text-primary"
                      >
                        Status
                        {sortField === "status" && (
                          <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("progress")}
                        className="font-semibold p-0 hover:bg-transparent hover:text-primary"
                      >
                        Progress
                        {sortField === "progress" && (
                          <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("enrollment_date")}
                        className="font-semibold p-0 hover:bg-transparent hover:text-primary"
                      >
                        Enrolled
                        {sortField === "enrollment_date" && (
                          <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="font-semibold p-0 hover:bg-transparent hover:text-primary"
                      >
                        Courses
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map(renderStudentRow)}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={selectedStudent.avatar} 
                      alt={selectedStudent.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.name}`;
                      }}
                    />
                    <AvatarFallback>
                      {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selectedStudent.name}</DialogTitle>
                    <DialogDescription>{selectedStudent.email}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <div className="mt-1">{getStatusBadge(selectedStudent.status)}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                    <p className="mt-1">{selectedStudent.phone || "Not provided"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Enrollment Date</h4>
                  <p className="mt-1">{formatEnrolledDate(selectedStudent.enrollment_date || selectedStudent.enrolled_date || '')}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.enrollment_date ? getTimeAgo(selectedStudent.enrollment_date) : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Overall Progress</h4>
                  <div className="space-y-2">
                    <Progress 
                      value={selectedStudent.progress} 
                      className={`h-2 ${getProgressColor(selectedStudent.progress)}`}
                    />
                    <div className="flex justify-between text-sm">
                      <span>{selectedStudent.completed_courses} of {selectedStudent.total_courses} courses completed</span>
                      <span className="font-medium">{selectedStudent.progress}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Current Tutorial */}
                {selectedStudent.tutorial_title && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Current Tutorial</h4>
                    <div className="p-3 rounded-lg border">
                      <p className="font-medium">{selectedStudent.tutorial_title}</p>
                      {selectedStudent.tutorial_id && (
                        <p className="text-xs text-muted-foreground">ID: {selectedStudent.tutorial_id}</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Last Active</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStudent.last_accessed || selectedStudent.last_active || 'Never'}</span>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Close
                </Button>
                <div className="flex gap-2 w-full sm:w-auto">
                  {selectedStudent.phone && (
                    <Button variant="outline" onClick={() => handleCall(selectedStudent.phone)} className="flex-1">
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                  )}
                  <Button onClick={() => handleSendEmail(selectedStudent.email)} className="flex-1">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsTab;