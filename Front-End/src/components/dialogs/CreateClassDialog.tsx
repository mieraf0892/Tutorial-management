import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateClassDialog({ open, onOpenChange }: CreateClassDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a class name");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const classCode = Math.random().toString(36).substring(2, 11).toUpperCase();
      toast.success(`Class created! Share code: ${classCode}`);
      setFormData({ name: "", description: "", category: "" });
      setIsLoading(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg animate-scale-in">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
          <DialogDescription>Set up a new class for your students</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="className">Class Name *</Label>
            <Input
              id="className"
              placeholder="e.g., Advanced React Development"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Web Development"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <Button 
            onClick={handleCreate} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Creating..." : "Create Class"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
