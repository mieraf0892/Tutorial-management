// src/components/Admin-Dashboard/CourseCatalogTab.tsx
import { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  BookOpen, 
  Eye, 
  Edit, 
  Trash2,
  MoreVertical,
  UserCheck
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import CreateCourseDialog from "./CreateCourseDialog";
import AssignTutorsDialog from "./AssignTutorsDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";

import CourseTutorialsDialog from "./CourseTutorialsDialog";

// Types
interface Category {
  id: number;
  name: string;
  full_path: string;
  slug: string;
}

interface Tutor {
  id: number;
  name: string;
  email?: string;
  pivot?: {
    course_id: number;
    tutor_id: number;
    created_at: string;
    updated_at: string;
  };
}

interface Course {
  id: number;
  title: string;
  description?: string;
  category_id: number | null;
  category: Category | null;
  duration_hours: number;
  price_group: string | null;
  price_individual: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  tutors?: Tutor[];
}

interface CourseCatalogTabProps {
  searchQuery?: string;
  onRefresh?: () => void;
}

export default function CourseCatalogTab({ 
  searchQuery = "", 
  onRefresh 
}: CourseCatalogTabProps) {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [currentCourseForAssign, setCurrentCourseForAssign] = useState<Course | null>(null);
  const [tutorSearch, setTutorSearch] = useState("");
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(false);

  const [showTutorialsDialog, setShowTutorialsDialog] = useState(false);
  const [currentCourseForTutorials, setCurrentCourseForTutorials] = useState<Course | null>(null);

  const handleViewTutorials = (course: Course) => {
    setCurrentCourseForTutorials(course);
    setShowTutorialsDialog(true);
  };

  // Fetch subcategories
  const fetchSubcategories = async () => {
    try {
      const res = await apiClient.get("/admin/categories-tree");
      if (res.data.success) {
        setSubcategories(res.data.subcategories || []);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load subcategories",
        variant: "destructive",
      });
    }
  };

  // Fetch tutors
  useEffect(() => {
    const fetchTutors = async () => {
      setLoadingTutors(true);
      try {
        // Try different possible endpoints
        const endpoints = [
          '/admin/users?role=tutor',
          '/admin/tutors',
          '/tutors',
          '/admin/users/tutors'
        ];
        
        let tutorsData: Tutor[] = [];
        for (const endpoint of endpoints) {
          try {
            const res = await apiClient.get(endpoint);
            if (res.data.success) {
              tutorsData = res.data.data || res.data.tutors || res.data.users || [];
              if (tutorsData.length > 0) break;
            }
          } catch (e) {
            continue;
          }
        }
        
        setTutors(tutorsData);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load tutors list",
          variant: "destructive",
        });
      } finally {
        setLoadingTutors(false);
      }
    };
    
    fetchTutors();
  }, []);

  // Filter tutors for search
  const filteredTutors = useMemo(() => {
    const searchLower = tutorSearch.toLowerCase();
    return tutors.filter(tutor => 
      tutor.name.toLowerCase().includes(searchLower) ||
      (tutor.email && tutor.email.toLowerCase().includes(searchLower))
    );
  }, [tutors, tutorSearch]);

  // Handle assigning a single tutor
  const handleAssignSingleTutor = async (courseId: number, tutorId: number, tutorName: string) => {
    try {
      const res = await apiClient.post(`/admin/courses/${courseId}/assign-tutors`, {
        tutor_ids: [tutorId],
      });

      if (res.data.success) {
        toast({
          title: "Success",
          description: `Assigned ${tutorName} to the course`,
        });
        
        // Refresh course data
        await fetchCourses();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to assign tutor",
        variant: "destructive",
      });
    }
  };

  // Update the fetchCourses function
const fetchCourses = async () => {
  try {
    setLoading(true);
    const params: any = {};
    if (searchQuery) params.search = searchQuery;

    const res = await apiClient.get("/admin/courses", { params });

    if (res.data.success) {
      // Extract the actual courses array from paginated response
      const coursesData = res.data.data?.data || res.data.data || [];
      
      // If courses don't have category data, we need to fetch categories separately
      // and merge them
      if (coursesData.length > 0 && !coursesData[0].category) {
        // Fetch categories tree to get all categories
        const categoriesRes = await apiClient.get("/admin/categories-tree");
        const allCategories = categoriesRes.data.subcategories || [];
        
        // Map category to each course
        const coursesWithCategories = coursesData.map((course: Course) => ({
          ...course,
          category: allCategories.find((cat: Category) => cat.id === course.category_id) || null
        }));
        
        setCourses(coursesWithCategories);
      } else {
        setCourses(coursesData);
      }
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to load courses",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  // Initial data fetch
  useEffect(() => {
    fetchSubcategories();
    fetchCourses();
  }, [searchQuery]);

  // Filter courses based on selected filters
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesCategory = 
        selectedSubcategory === "all" || 
        course.category_id?.toString() === selectedSubcategory;
      
      const matchesActive = !showActiveOnly || course.is_active;
      
      return matchesCategory && matchesActive;
    });
  }, [courses, selectedSubcategory, showActiveOnly]);

  // Handlers
  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setShowCreateDialog(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowCreateDialog(true);
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

    try {
      await apiClient.delete(`/admin/courses/${courseId}`);
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      fetchCourses();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  const handleViewCourse = (course: Course) => {
    toast({
      title: course.title,
      description: (
        <div className="space-y-2 text-sm">
          <p><strong>Subcategory:</strong> {course.category?.full_path || "Uncategorized"}</p>
          <p><strong>Description:</strong> {course.description || "No description"}</p>
          <p><strong>Duration:</strong> {course.duration_hours} hours</p>
          <p><strong>Group Price:</strong> {course.price_group ? `${course.price_group} ETB` : "Not set"}</p>
          <p><strong>Individual Price:</strong> {course.price_individual ? `${course.price_individual} ETB` : "Not set"}</p>
          <p><strong>Status:</strong> {course.is_active ? "Active" : "Inactive"}</p>
          <p><strong>Assigned Tutors:</strong> {course.tutors?.length || 0}</p>
          {course.tutors && course.tutors.length > 0 && (
            <div className="pl-2">
              {course.tutors.map(t => (
                <p key={t.id}>• {t.name} {t.email && `(${t.email})`}</p>
              ))}
            </div>
          )}
        </div>
      ),
      duration: 8000,
    });
  };

  const handleAssignTutors = (course: Course) => {
    setCurrentCourseForAssign(course);
    setShowAssignDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Course Catalog</h2>
          <p className="text-sm text-muted-foreground">
            Manage all available courses and assign tutors
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchCourses}>
            Refresh List
          </Button>
          <Button onClick={handleCreateCourse}>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <Label htmlFor="subcategory-filter" className="mb-1.5 block text-sm">
            Filter by Subcategory
          </Label>
          <Select 
            value={selectedSubcategory} 
            onValueChange={setSelectedSubcategory}
          >
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="All subcategories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              {subcategories.map((sub) => (
                <SelectItem key={sub.id} value={sub.id.toString()}>
                  {sub.full_path}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active-only"
            checked={showActiveOnly}
            onCheckedChange={setShowActiveOnly}
          />
          <Label htmlFor="active-only">Active courses only</Label>
        </div>
      </div>

      {/* Course Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Title & Description</TableHead>
              <TableHead>Subcategory</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Tutors</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading courses...
                </TableCell>
              </TableRow>
            ) : filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 py-6">
                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                    <p className="text-lg font-medium">No courses found</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSubcategory !== "all" || showActiveOnly
                        ? "Try changing filters"
                        : "Get started by creating your first course"}
                    </p>
                    <Button onClick={handleCreateCourse} className="mt-2">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Course
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => (
                <TableRow key={course.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description || "No description provided"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {course.category ? (
                      <Badge variant="outline" className="font-normal px-3 py-1">
                        {course.category.full_path}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell>{course.duration_hours} hrs</TableCell>
                  <TableCell>
                    <div className="space-y-0.5 text-sm">
                      <div>
                        Group: {course.price_group ? `${course.price_group} ETB` : "—"}
                      </div>
                      <div>
                        1:1: {course.price_individual ? `${course.price_individual} ETB` : "—"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={course.is_active ? "default" : "secondary"}>
                      {course.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {course.tutors && course.tutors.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {course.tutors.map(t => (
                          <Badge key={t.id} variant="secondary" className="text-xs">
                            {t.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewCourse(course)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewTutorials(course)}>
                          <BookOpen className="mr-2 h-4 w-4" />
                            View Tutorials
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        
                        {/* Assign Tutor Submenu */}
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Assign Tutor
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent className="w-80 max-h-[400px]">
                              <div className="p-2 sticky top-0 bg-background z-10">
                                <Input
                                  placeholder="Search tutors..."
                                  value={tutorSearch}
                                  onChange={(e) => setTutorSearch(e.target.value)}
                                  autoFocus
                                />
                              </div>
                              <DropdownMenuSeparator />
                              {loadingTutors ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  Loading tutors...
                                </div>
                              ) : filteredTutors.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  No tutors found
                                </div>
                              ) : (
                                <ScrollArea className="max-h-[300px]">
                                  {filteredTutors.map((tutor) => (
                                    <DropdownMenuItem
                                      key={tutor.id}
                                      onClick={() => handleAssignSingleTutor(course.id, tutor.id, tutor.name)}
                                      className="cursor-pointer flex items-center gap-3 py-2"
                                    >
                                      <div className="flex-1">
                                        <div className="font-medium">{tutor.name}</div>
                                        {tutor.email && (
                                          <div className="text-xs text-muted-foreground truncate">
                                            {tutor.email}
                                          </div>
                                        )}
                                      </div>
                                    </DropdownMenuItem>
                                  ))}
                                </ScrollArea>
                              )}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <CreateCourseDialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setSelectedCourse(null);
        }}
        onCourseCreated={() => {
          fetchCourses();
          if (onRefresh) onRefresh();
        }}
        editCourse={selectedCourse}
      />

      {/* Assign Tutors Dialog */}
      <AssignTutorsDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        courseId={currentCourseForAssign?.id || 0}
        courseTitle={currentCourseForAssign?.title || ""}
        onAssigned={fetchCourses}
      />

      <CourseTutorialsDialog
        open={showTutorialsDialog}
        onOpenChange={setShowTutorialsDialog}
        courseId={currentCourseForTutorials?.id || 0}
        courseTitle={currentCourseForTutorials?.title || ""}
      />
    </div>
  );
}