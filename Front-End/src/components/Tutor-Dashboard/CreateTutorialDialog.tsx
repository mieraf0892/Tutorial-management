// components/Tutor-Dashboard/CreateTutorialDialog.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Label } from "@/components/ui/label";
import { X, Plus, Upload, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CreateTutorialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTutorialCreated: () => void;
}

export default function CreateTutorialDialog({ 
  open, 
  onOpenChange, 
  onTutorialCreated 
}: CreateTutorialDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    level: "beginner",
    price: "",
    duration: "", // Changed back to duration to match database
    image: "",
    learning_objectives: [""], // Changed to match database column
    requirements: [""],
    instructor: "",
    instructor_bio: "",
    lessons: "",
    includes: [""]
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      fetchCategories();
    } else {
      // Reset form when closing
      setFormData({
        title: "",
        description: "",
        category_id: "",
        level: "beginner",
        price: "",
        duration: "",
        image: "",
        learning_objectives: [""],
        requirements: [""],
        instructor: "",
        instructor_bio: "",
        lessons: "",
        includes: [""]
      });
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/categories");
      if (response.data) {
        setCategories(response.data.categories || response.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: 'learning_objectives' | 'requirements' | 'includes', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'learning_objectives' | 'requirements' | 'includes') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  const removeArrayItem = (field: 'learning_objectives' | 'requirements' | 'includes', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for submission - match database column names
      const submissionData = {
        title: formData.title,
        description: formData.description,
        category_id: parseInt(formData.category_id),
        level: formData.level,
        price: parseFloat(formData.price) || 0,
        duration: parseInt(formData.duration) || 1, // Match database column name
        image: formData.image || null,
        learning_objectives: formData.learning_objectives.filter(item => item.trim() !== ""),
        requirements: formData.requirements.filter(item => item.trim() !== ""),
        instructor: formData.instructor || "Tutor", // Default value
        instructor_bio: formData.instructor_bio || "",
        lessons: parseInt(formData.lessons) || 0,
        includes: formData.includes.filter(item => item.trim() !== ""),
        is_published: false,
        students: 0, // Default values
        rating: 0,
        content: "" // Empty default
      };

      console.log("Submitting data:", submissionData);

      const response = await apiClient.post("/tutor/tutorials", submissionData);
      
      if (response.data.success) {
        toast({
          title: "Success!",
          description: "Tutorial created successfully",
        });
        onTutorialCreated();
        onOpenChange(false);
      } else {
        throw new Error(response.data.message || "Failed to create tutorial");
      }
    } catch (error: any) {
      console.error("Create tutorial error:", error);
      console.error("Error response:", error.response?.data);
      
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
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Create New Tutorial</h2>
            <p className="text-muted-foreground">
              Build and publish your tutorial to start teaching
            </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the essential details about your tutorial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tutorial Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Advanced React Patterns"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn in this tutorial..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange('category_id', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Difficulty Level *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => handleInputChange('level', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="10"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lessons">Number of Lessons</Label>
                  <Input
                    id="lessons"
                    type="number"
                    min="0"
                    placeholder="12"
                    value={formData.lessons}
                    onChange={(e) => handleInputChange('lessons', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor Name</Label>
                  <Input
                    id="instructor"
                    type="text"
                    placeholder="Your name"
                    value={formData.instructor}
                    onChange={(e) => handleInputChange('instructor', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Cover Image URL</Label>
                  <Input
                    id="image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor_bio">Instructor Bio</Label>
                <Textarea
                  id="instructor_bio"
                  placeholder="Tell students about your experience and background..."
                  rows={2}
                  value={formData.instructor_bio}
                  onChange={(e) => handleInputChange('instructor_bio', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Learning Objectives Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Learning Objectives</CardTitle>
                  <CardDescription>
                    What students will learn from this tutorial
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('learning_objectives')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Objective
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.learning_objectives.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="e.g., Build real-world applications with React"
                    value={item}
                    onChange={(e) => handleArrayInputChange('learning_objectives', index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayItem('learning_objectives', index)}
                    disabled={formData.learning_objectives.length === 1}
                    className="h-10 w-10 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Requirements Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Requirements</CardTitle>
                  <CardDescription>
                    What students should know before taking this tutorial
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('requirements')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Requirement
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.requirements.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="e.g., Basic JavaScript knowledge"
                    value={item}
                    onChange={(e) => handleArrayInputChange('requirements', index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayItem('requirements', index)}
                    disabled={formData.requirements.length === 1}
                    className="h-10 w-10 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Includes Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>What's Included</CardTitle>
                  <CardDescription>
                    Additional resources and features included
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('includes')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.includes.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="e.g., Downloadable resources, Certificate of completion"
                    value={item}
                    onChange={(e) => handleArrayInputChange('includes', index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeArrayItem('includes', index)}
                    disabled={formData.includes.length === 1}
                    className="h-10 w-10 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Tutorial...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Create Tutorial
                </>
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