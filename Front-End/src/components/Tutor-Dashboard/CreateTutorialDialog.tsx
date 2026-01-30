// components/Tutor-Dashboard/CreateTutorialDialog.tsx - UPDATED VERSION
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  X, 
  Loader2, 
  BookOpen, 
  Target,
  CheckSquare,
  User,
  Briefcase,
  Plus,
  Trash2
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Course {
  id: number;
  title: string;
  description: string;
  duration_hours: number;
  price_group: number;
  price_individual: number;
  category_id: number;
}

interface TutorProfile {
  name: string;
  email: string;
  bio?: string;
  experience?: string;
}

interface CreateTutorialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTutorialCreated: () => void;
  courseId: number; // REQUIRED: Must provide courseId
  courseTitle?: string; // Optional: Pre-fetched course title
}

export default function CreateTutorialDialog({ 
  open, 
  onOpenChange, 
  onTutorialCreated,
  courseId,
  courseTitle
}: CreateTutorialDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Content-focused form data
  const [formData, setFormData] = useState({
    // Required fields
    title: "",
    description: "",
    level: "intermediate" as "beginner" | "intermediate" | "advanced",
    
    // Content details
    learning_objectives: [""], // Array of objectives
    requirements: [""], // Array of requirements
    includes: [""], // Array of what's included
    
    // Optional schedule info (admin may override)
    batch_name: "",
    schedule: "",
    start_date: "",
  });

  // For managing arrays in form
  const [newObjective, setNewObjective] = useState("");
  const [newRequirement, setNewRequirement] = useState("");
  const [newInclude, setNewInclude] = useState("");

  useEffect(() => {
    if (open && courseId) {
      fetchCourseAndTutorData();
    } else {
      // Reset form when closing
      setFormData({
        title: "",
        description: "",
        level: "intermediate",
        learning_objectives: [""],
        requirements: [""],
        includes: [""],
        batch_name: "",
        schedule: "",
        start_date: "",
      });
      setCourse(null);
      setTutorProfile(null);
      setNewObjective("");
      setNewRequirement("");
      setNewInclude("");
    }
  }, [open, courseId]);

  const fetchCourseAndTutorData = async () => {
    try {
      setIsLoadingData(true);
      
      // Fetch course details
      const courseResponse = await apiClient.get(`/courses/${courseId}`);
      if (courseResponse.data.success) {
        const courseData = courseResponse.data.data;
        setCourse(courseData);
        
        // Auto-generate title
        setFormData(prev => ({
          ...prev,
          title: `${courseData.title} - My Version`,
          description: `My personalized teaching approach for ${courseData.title}.`
        }));
      } else {
        throw new Error("Failed to load course details");
      }
      
      // Fetch tutor profile
      const tutorResponse = await apiClient.get("/tutor/profile");
      if (tutorResponse.data.success) {
        setTutorProfile(tutorResponse.data.data);
      }
      
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: "Failed to load course or profile data",
        variant: "destructive",
      });
      onOpenChange(false);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Helper functions for array fields
  const addLearningObjective = () => {
    if (newObjective.trim()) {
      setFormData(prev => ({
        ...prev,
        learning_objectives: [...prev.learning_objectives.filter(obj => obj.trim()), newObjective.trim()]
      }));
      setNewObjective("");
    }
  };

  const removeLearningObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learning_objectives: prev.learning_objectives.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements.filter(req => req.trim()), newRequirement.trim()]
      }));
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addInclude = () => {
    if (newInclude.trim()) {
      setFormData(prev => ({
        ...prev,
        includes: [...prev.includes.filter(inc => inc.trim()), newInclude.trim()]
      }));
      setNewInclude("");
    }
  };

  const removeInclude = (index: number) => {
    setFormData(prev => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent, submitType: 'draft' | 'submit') => {
    e.preventDefault();
    
    if (!course) {
      toast({
        title: "Error",
        description: "Course data not loaded",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and description are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Filter out empty strings from arrays
      const filteredObjectives = formData.learning_objectives.filter(obj => obj.trim());
      const filteredRequirements = formData.requirements.filter(req => req.trim());
      const filteredIncludes = formData.includes.filter(inc => inc.trim());

      // Prepare tutorial data - CONTENT PACKAGE FOCUSED
      // In handleSubmit function - UPDATED DATA STRUCTURE
const tutorialData = {
  // Required
  course_id: courseId,
  title: formData.title,
  description: formData.description,
  level: formData.level,
  
  // Content arrays
  learning_objectives: filteredObjectives.length > 0 
    ? filteredObjectives 
    : ["Students will master the course content"],
  requirements: filteredRequirements.length > 0 
    ? filteredRequirements 
    : ["Basic knowledge of the subject"],
  
  // Tutor info
  instructor_bio: tutorProfile?.bio || "",
  
  // Optional schedule info
  batch_name: formData.batch_name.trim() || "Content Package",
  schedule: formData.schedule.trim() || "Flexible schedule",
  start_date: formData.start_date || null,
  
  // Status
  status: submitType === 'submit' ? 'pending_approval' : 'draft',
  
  // REMOVED: category_id, includes, instructor_experience, price, duration
  // These are inherited from course or don't exist in database
};

      console.log("Creating tutorial content package:", tutorialData);

      const response = await apiClient.post("/tutor/tutorials", tutorialData);
      
      if (response.data.success) {
        toast({
          title: submitType === 'submit' ? "✅ Tutorial Submitted!" : "✅ Draft Saved!",
          description: submitType === 'submit' 
            ? "Tutorial submitted for admin approval. You'll be notified when approved."
            : "Tutorial saved as draft. You can continue editing later.",
        });
        onTutorialCreated();
        onOpenChange(false);
      } else {
        throw new Error(response.data.message || "Failed to create tutorial");
      }
    } catch (error: any) {
      console.error("Create tutorial error:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to create tutorial";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal Content */}
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Create Tutorial Content Package
            </h2>
            <p className="text-muted-foreground">
              Create your teaching content for this course
            </p>
            
            {course && (
              <div className="text-sm bg-blue-50 p-3 rounded border border-blue-200 mt-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium">Course: {course.title}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <span>Duration: {course.duration_hours} hours</span>
                  <span>Price: ${course.price_group} (group)</span>
                  <span>Category ID: {course.category_id}</span>
                </div>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => e.preventDefault()} className="p-6 space-y-6">
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading course details...</p>
            </div>
          ) : course ? (
            <>
              {/* Course Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Course Information
                  </CardTitle>
                  <CardDescription>
                    You're creating content for this course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Course Title</Label>
                      <p className="font-medium">{course.title}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Duration</Label>
                      <p className="font-medium">{course.duration_hours} hours</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="text-muted-foreground line-clamp-3">{course.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Tutorial Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Tutorial Information</CardTitle>
                  <CardDescription>
                    Define your version of this course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Tutorial Title *</Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="e.g., Python for AI - Hands-on Practical Edition"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Your unique title for this content package
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="level">Target Level *</Label>
                      <Select
                        value={formData.level}
                        onValueChange={(value: "beginner" | "intermediate" | "advanced") => 
                          handleInputChange('level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your teaching approach, focus areas, and methodology..."
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Explain how you'll teach this course differently
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Objectives */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Learning Objectives
                  </CardTitle>
                  <CardDescription>
                    What will students learn from your tutorial?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {formData.learning_objectives
                      .filter(obj => obj.trim())
                      .map((objective, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <CheckSquare className="w-3 h-3 text-green-600" />
                          <span className="flex-1 text-sm">{objective}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLearningObjective(index)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Add a learning objective..."
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningObjective())}
                    />
                    <Button type="button" onClick={addLearningObjective} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                  <CardDescription>
                    What do students need before starting?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {formData.requirements
                      .filter(req => req.trim())
                      .map((requirement, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Badge variant="outline" className="text-xs">Req</Badge>
                          <span className="flex-1 text-sm">{requirement}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRequirement(index)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Add a requirement..."
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    />
                    <Button type="button" onClick={addRequirement} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* What's Included */}
              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                  <CardDescription>
                    What materials/resources will you provide?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {formData.includes
                      .filter(inc => inc.trim())
                      .map((include, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Badge variant="secondary" className="text-xs">Included</Badge>
                          <span className="flex-1 text-sm">{include}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInclude(index)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Add what's included..."
                      value={newInclude}
                      onChange={(e) => setNewInclude(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclude())}
                    />
                    <Button type="button" onClick={addInclude} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Optional: Schedule Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Optional: Suggested Schedule</CardTitle>
                  <CardDescription>
                    You can suggest a schedule (admin may adjust)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="batch_name">Batch Name (Optional)</Label>
                      <Input
                        id="batch_name"
                        type="text"
                        placeholder="e.g., January 2026 Batch"
                        value={formData.batch_name}
                        onChange={(e) => handleInputChange('batch_name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Suggested Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleInputChange('start_date', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Suggested Schedule</Label>
                    <Input
                      id="schedule"
                      type="text"
                      placeholder="e.g., Monday & Wednesday 6-8 PM"
                      value={formData.schedule}
                      onChange={(e) => handleInputChange('schedule', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tutor Info Preview */}
              {tutorProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Your Tutor Profile
                    </CardTitle>
                    <CardDescription>
                      This information will be shown to students
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{tutorProfile.name}</p>
                        <p className="text-muted-foreground">{tutorProfile.email}</p>
                      </div>
                    </div>
                    {tutorProfile.bio && (
                      <div>
                        <Label className="text-muted-foreground">Bio</Label>
                        <p className="mt-1">{tutorProfile.bio}</p>
                      </div>
                    )}
                    {tutorProfile.experience && (
                      <div>
                        <Label className="text-muted-foreground flex items-center gap-2">
                          <Briefcase className="w-3 h-3" />
                          Experience
                        </Label>
                        <p className="mt-1">{tutorProfile.experience}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Course information not available</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={loading || isLoadingData || !course}
              variant="outline"
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save as Draft"
              )}
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, 'submit')}
              disabled={loading || isLoadingData || !course}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit for Approval"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}