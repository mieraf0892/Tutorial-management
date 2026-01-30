import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { BookOpen, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "../ui/badge";

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassCreated: () => void;
}

interface Tutor {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  duration_hours: number;
  price_group: number | null;
  price_individual: number | null;
}

export default function CreateClassDialog({
  open,
  onOpenChange,
  onClassCreated
}: CreateClassDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, number>>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tutor_id: "",
    category_id: "",
    course_id: "",
    batch_name: "",
    duration: "10 hours",
    level: "Beginner",
    price: "0",
    max_capacity: "30",
    schedule: "",
    start_date: "",
    end_date: "",
    enrollment_code: "",
    learning_objectives: [] as string[],
    includes: [] as string[],
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
    is_published: true
  });

  const [learningObjective, setLearningObjective] = useState("");
  const [includeItem, setIncludeItem] = useState("");

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      setFetching(true);
      
      // Fetch active tutors
      const tutorsResponse = await apiClient.get("/admin/users?role=tutor&status=active");
      if (tutorsResponse.data.success) {
        setTutors(tutorsResponse.data.users || []);
      }
      
      // Fetch categories and build mapping
      const categoriesResponse = await apiClient.get("/categories");
      if (categoriesResponse.data.success) {
        const categoriesData = categoriesResponse.data.categories || categoriesResponse.data.data || [];
        setCategories(categoriesData);
        
        // Build mapping: category name/slug -> category id
        const mapping: Record<string, number> = {};
        categoriesData.forEach((cat: any) => {
          // Map by slug or name
          mapping[cat.slug || cat.name.toLowerCase().replace(' ', '-')] = cat.id;
          mapping[cat.name.toLowerCase()] = cat.id;
        });
        setCategoryMap(mapping);
      }
      
      // Fetch active courses
      const coursesResponse = await apiClient.get("/admin/courses?is_active=true");
      if (coursesResponse.data.success) {
        const coursesData = coursesResponse.data.data.data || coursesResponse.data.data || [];
        setCourses(coursesData);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  const handleCourseSelect = (courseId: string) => {
    setFormData(prev => ({ ...prev, course_id: courseId }));
    
    if (courseId) {
      const course = courses.find(c => c.id.toString() === courseId);
      if (course) {
        setSelectedCourse(course);
        
        // Try to find matching category
        const courseCategory = course.category.toLowerCase();
        let matchedCategoryId = "";
        
        // Try different mappings
        if (categoryMap[courseCategory]) {
          matchedCategoryId = categoryMap[courseCategory].toString();
        } else if (categoryMap[courseCategory.replace('-', ' ')]) {
          matchedCategoryId = categoryMap[courseCategory.replace('-', ' ')].toString();
        } else if (categoryMap[courseCategory.replace(' ', '-')]) {
          matchedCategoryId = categoryMap[courseCategory.replace(' ', '-')].toString();
        }
        
        // Auto-fill fields from course
        setFormData(prev => ({
          ...prev,
          title: course.title + (prev.batch_name ? ` - ${prev.batch_name}` : ""),
          description: course.description || prev.description,
          duration: `${course.duration_hours} hours`,
          price: course.price_group ? course.price_group.toString() : "0",
          category_id: matchedCategoryId || prev.category_id, // Auto-set category if found
        }));
      }
    } else {
      setSelectedCourse(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for required fields
    if (!formData.course_id || !formData.tutor_id || !formData.start_date || !formData.end_date) {
      toast({
        title: "Validation Error",
        description: "Please select a course, tutor, and set dates",
        variant: "destructive",
      });
      return;
    }
    
    // Validation for category if not auto-selected
    if (!formData.category_id) {
      toast({
        title: "Validation Error",
        description: "Please select a category for this course",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const payload = {
        title: formData.title,
        description: formData.description,
        tutor_id: parseInt(formData.tutor_id),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        course_id: parseInt(formData.course_id),
        batch_name: formData.batch_name,
        duration: formData.duration,
        level: formData.level,
        price: parseFloat(formData.price),
        max_capacity: parseInt(formData.max_capacity),
        schedule: formData.schedule,
        start_date: formData.start_date,
        end_date: formData.end_date,
        enrollment_code: formData.enrollment_code || `CLASS-${Date.now()}`,
        learning_objectives: formData.learning_objectives,
        includes: formData.includes,
        image: formData.image,
        is_published: formData.is_published
      };
      
      const response = await apiClient.post("/admin/classes", payload);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Class created successfully",
        });
        
        onClassCreated();
        onOpenChange(false);
        
        // Reset form
        setFormData({
          title: "",
          description: "",
          tutor_id: "",
          category_id: "",
          course_id: "",
          batch_name: "",
          duration: "10 hours",
          level: "Beginner",
          price: "0",
          max_capacity: "30",
          schedule: "",
          start_date: "",
          end_date: "",
          enrollment_code: "",
          learning_objectives: [],
          includes: [],
          image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
          is_published: true
        });
        setSelectedCourse(null);
        setLearningObjective("");
        setIncludeItem("");
      }
    } catch (error: any) {
      console.error("Create class error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create class",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update title when batch name changes if course is selected
    if (name === "batch_name" && selectedCourse) {
      setFormData(prev => ({
        ...prev,
        title: selectedCourse.title + (value ? ` - ${value}` : "")
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addLearningObjective = () => {
    if (learningObjective.trim()) {
      setFormData(prev => ({
        ...prev,
        learning_objectives: [...prev.learning_objectives, learningObjective.trim()]
      }));
      setLearningObjective("");
    }
  };

  const removeLearningObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learning_objectives: prev.learning_objectives.filter((_, i) => i !== index)
    }));
  };

  const addIncludeItem = () => {
    if (includeItem.trim()) {
      setFormData(prev => ({
        ...prev,
        includes: [...prev.includes, includeItem.trim()]
      }));
      setIncludeItem("");
    }
  };

  const removeIncludeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'objective' | 'include') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'objective') {
        addLearningObjective();
      } else {
        addIncludeItem();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
          <DialogDescription>
            Create a new group class based on an existing course template
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Selection Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Select Course Template</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="course_id">Course *</Label>
              <Select
                value={formData.course_id}
                onValueChange={handleCourseSelect}
                disabled={loading || fetching || courses.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={fetching ? "Loading courses..." : "Select a course template"} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{course.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {course.category} • {course.duration_hours} hours • ${course.price_group || "0"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {courses.length === 0 && !fetching && (
                <p className="text-sm text-muted-foreground">
                  No active courses available. Create courses first in the Course Catalog.
                </p>
              )}
            </div>

            {/* Show selected course details */}
            {selectedCourse && (
              <div className="p-3 border rounded bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{selectedCourse.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedCourse.description || "No description"}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedCourse.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {selectedCourse.duration_hours} hours
                      </Badge>
                      {selectedCourse.price_group && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          ${selectedCourse.price_group} (Group)
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Class Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Class Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Python Programming - Jan 2025 Batch"
                required
                disabled={loading || fetching}
              />
              <p className="text-xs text-muted-foreground">
                Auto-filled from course. You can modify for this specific batch.
              </p>
            </div>
            
            {/* Batch Name */}
            <div className="space-y-2">
              <Label htmlFor="batch_name">Batch Name (Optional)</Label>
              <Input
                id="batch_name"
                name="batch_name"
                value={formData.batch_name}
                onChange={handleInputChange}
                placeholder="e.g., Jan 2025 Batch, Morning Batch"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Helps identify different sessions of the same course
              </p>
            </div>
            
            {/* Tutor */}
            <div className="space-y-2">
              <Label htmlFor="tutor_id">Tutor *</Label>
              <Select
                value={formData.tutor_id}
                onValueChange={(value) => handleSelectChange("tutor_id", value)}
                disabled={loading || fetching || tutors.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={fetching ? "Loading tutors..." : "Select a tutor"} />
                </SelectTrigger>
                <SelectContent>
                  {tutors.map((tutor) => (
                    <SelectItem key={tutor.id} value={tutor.id.toString()}>
                      {tutor.name} ({tutor.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {tutors.length === 0 && !fetching && (
                <p className="text-sm text-muted-foreground">No active tutors available</p>
              )}
            </div>
            
            {/* Category Selection - with warning if not auto-matched */}
            <div className="space-y-2">
              <Label htmlFor="category_id">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleSelectChange("category_id", value)}
                disabled={loading || fetching || categories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={fetching ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color || '#6b7280' }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Warning if category not auto-selected */}
              {formData.course_id && !formData.category_id && (
                <div className="flex items-center gap-2 text-amber-600 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please select a category for this course</span>
                </div>
              )}
              
              {/* Info if category was auto-selected */}
              {formData.course_id && formData.category_id && (
                <div className="flex items-center gap-2 text-green-600 text-sm mt-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Category auto-selected based on course</span>
                </div>
              )}
            </div>
            
            {/* Max Capacity */}
            <div className="space-y-2">
              <Label htmlFor="max_capacity">Maximum Students *</Label>
              <Input
                id="max_capacity"
                name="max_capacity"
                type="number"
                min="1"
                max="100"
                value={formData.max_capacity}
                onChange={handleInputChange}
                placeholder="e.g., 30"
                required
                disabled={loading}
              />
            </div>
            
            {/* Enrollment Code */}
            <div className="space-y-2">
              <Label htmlFor="enrollment_code">Enrollment Code (Optional)</Label>
              <Input
                id="enrollment_code"
                name="enrollment_code"
                value={formData.enrollment_code}
                onChange={handleInputChange}
                placeholder="e.g., PYTHON-JAN2025"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Unique code for students to enroll. Auto-generated if left empty.
              </p>
            </div>
            
            {/* Level */}
            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => handleSelectChange("level", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 10 weeks, 30 hours"
                required
                disabled={loading}
              />
            </div>
            
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>
            
            {/* Schedule */}
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule (Optional)</Label>
              <Input
                id="schedule"
                name="schedule"
                value={formData.schedule}
                onChange={handleInputChange}
                placeholder="e.g., Mon, Wed, Fri 6-7 PM"
                disabled={loading}
              />
            </div>
            
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
            
            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what students will learn in this class..."
              rows={4}
              required
              disabled={loading}
            />
          </div>
          
          {/* Learning Objectives */}
          <div className="space-y-2">
            <Label>Learning Objectives (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'objective')}
                placeholder="Add a learning objective"
                disabled={loading}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addLearningObjective}
                disabled={loading}
              >
                Add
              </Button>
            </div>
            {formData.learning_objectives.length > 0 && (
              <div className="space-y-1 mt-2">
                {formData.learning_objectives.map((obj, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span>• {obj}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLearningObjective(index)}
                      disabled={loading}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Includes */}
          <div className="space-y-2">
            <Label>What's Included (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={includeItem}
                onChange={(e) => setIncludeItem(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'include')}
                placeholder="Add an included item (e.g., Certificate)"
                disabled={loading}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addIncludeItem}
                disabled={loading}
              >
                Add
              </Button>
            </div>
            {formData.includes.length > 0 && (
              <div className="space-y-1 mt-2">
                {formData.includes.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span>✓ {item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIncludeItem(index)}
                      disabled={loading}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image">Image URL (Optional)</Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              disabled={loading}
            />
          </div>
          
          {/* Publish Switch */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_published: checked }))
                }
                disabled={loading}
              />
              <Label htmlFor="is_published" className="cursor-pointer">
                Publish immediately
              </Label>
            </div>
          </div>
          
          {/* Dialog Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || fetching || !formData.course_id || !formData.tutor_id || !formData.category_id}
            >
              {loading ? "Creating..." : "Create Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}