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
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tutor_id: "",
    category_id: "",
    duration: "10 hours",
    level: "Beginner",
    price: "0",
    learning_objectives: [] as string[],
    includes: [] as string[],
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
    is_published: true
  });

  const [learningObjective, setLearningObjective] = useState("");
  const [includeItem, setIncludeItem] = useState("");

  useEffect(() => {
    if (open) {
      fetchTutorsAndCategories();
    }
  }, [open]);

  const fetchTutorsAndCategories = async () => {
    try {
      setFetching(true);
      
      // Fetch active tutors
      const tutorsResponse = await apiClient.get("/admin/users?role=tutor&status=active");
      if (tutorsResponse.data.success) {
        setTutors(tutorsResponse.data.users || []);
      }
      
      // Fetch categories
      const categoriesResponse = await apiClient.get("/categories");
      if (categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.categories || []);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load tutors and categories",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.tutor_id || !formData.category_id) {
      toast({
        title: "Validation Error",
        description: "Please select a tutor and category",
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
        category_id: parseInt(formData.category_id),
        duration: formData.duration,
        level: formData.level,
        price: parseFloat(formData.price),
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
          duration: "10 hours",
          level: "Beginner",
          price: "0",
          learning_objectives: [],
          includes: [],
          image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
          is_published: true
        });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
          <DialogDescription>
            Create a new tutorial/class and assign it to a tutor
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Class Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Advanced React Development"
                required
                disabled={loading || fetching}
              />
            </div>
            
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
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
          </div>
          
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
                placeholder="Add a learning objective"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningObjective())}
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
                placeholder="Add an included item (e.g., Certificate)"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncludeItem())}
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
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || fetching}>
              {loading ? "Creating..." : "Create Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}