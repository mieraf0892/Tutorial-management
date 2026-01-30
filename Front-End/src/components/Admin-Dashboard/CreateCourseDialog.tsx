// src/components/Admin-Dashboard/CreateCourseDialog.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { Switch } from '../ui/switch';

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category_id: z.string().min(1, "Please select a category"),
  subcategory_id: z.string().min(1, "Please select a subcategory"),
  duration_hours: z.coerce.number().min(1, "Duration must be at least 1 hour"),
  price_group: z.coerce.number().min(0, "Group price cannot be negative"),
  price_individual: z.coerce.number().min(0, "Individual price cannot be negative"),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface Subcategory {
  id: number;
  name: string;
  full_path: string;
  parent_id: number;
  level: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseCreated: () => void;
  editCourse?: any;
}

export default function CreateCourseDialog({
  open,
  onOpenChange,
  onCourseCreated,
  editCourse,
}: Props) {
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      subcategory_id: "",
      duration_hours: 10,
      price_group: 0,
      price_individual: 0,
      is_active: true,
    },
  });

  const selectedCategoryId = form.watch("category_id");

  // Filter subcategories when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      const filtered = allSubcategories.filter(
        sub => sub.parent_id.toString() === selectedCategoryId
      );
      setFilteredSubcategories(filtered);
      form.setValue("subcategory_id", "");
    } else {
      setFilteredSubcategories([]);
      form.setValue("subcategory_id", "");
    }
  }, [selectedCategoryId, allSubcategories, form]);

  // Fetch subcategories and build top-level list
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const res = await apiClient.get("/admin/categories-tree");
          if (res.data.success) {
            const subs = res.data.subcategories || [];
            setAllSubcategories(subs);

            // Build top-level categories from parent_ids
            const topLevelMap = new Map<number, any>();
            subs.forEach((sub: Subcategory) => {
              if (sub.parent_id && !topLevelMap.has(sub.parent_id)) {
                // Create minimal top-level object (we'll use parent_id as key)
                topLevelMap.set(sub.parent_id, {
                  id: sub.parent_id,
                  name: sub.full_path.split(" > ")[0], // extract top-level name
                });
              }
            });

            setTopCategories(Array.from(topLevelMap.values()));
          }
        } catch (err: any) {
          toast.error("Failed to load categories");
        }
      };
      fetchData();
    }
  }, [open]);

  // Pre-fill for edit mode
  useEffect(() => {
    if (open && editCourse) {
      form.reset({
        title: editCourse.title || "",
        description: editCourse.description || "",
        category_id: editCourse.category?.parent_id?.toString() || "",
        subcategory_id: editCourse.category_id?.toString() || "",
        duration_hours: editCourse.duration_hours || 10,
        price_group: Number(editCourse.price_group) || 0,
        price_individual: Number(editCourse.price_individual) || 0,
        is_active: editCourse.is_active !== false,
      });
    }
  }, [open, editCourse, form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const payload = {
        title: values.title,
        description: values.description,
        category_id: parseInt(values.subcategory_id), // send subcategory ID
        duration_hours: values.duration_hours,
        price_group: values.price_group,
        price_individual: values.price_individual,
        is_active: values.is_active,
      };

      let res;
      if (editCourse) {
        res = await apiClient.put(`/admin/courses/${editCourse.id}`, payload);
      } else {
        res = await apiClient.post("/admin/courses", payload);
      }

      if (res.data.success) {
        toast.success(editCourse ? "Course updated!" : "Course created!");
        form.reset();
        onCourseCreated();
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Python for AI Beginners" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category (top-level) */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {topCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subcategory */}
            <FormField
              control={form.control}
              name="subcategory_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategoryId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          selectedCategoryId ? "Select subcategory" : "Select category first"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSubcategories.length === 0 && selectedCategoryId ? (
                        <SelectItem value="none" disabled>
                          No subcategories available
                        </SelectItem>
                      ) : (
                        filteredSubcategories.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id.toString()}>
                            {sub.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration & Prices */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="duration_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (hours) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Price (ETB) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_individual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Individual Price (ETB) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Active toggle */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>Active (visible to students)</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? (editCourse ? "Updating..." : "Creating...") 
                  : (editCourse ? "Update Course" : "Create Course")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}