import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, FileText, Loader2, Archive, PlayCircle, PauseCircle } from "lucide-react";
import { apiClient } from "@/lib/api";

interface ClassData {
  id: string;
  name: string;
  tutor: string;
  students: number;
  rating: number;
  status: "active" | "archived" | "suspended";
  tutor_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface ManageClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: ClassData | null;
  onClassUpdated?: () => void;
}

// Simple toast fallback if useToast hook fails
const useToastFallback = () => {
  return {
    toast: (options: any) => {
      if (options.variant === 'destructive') {
        console.error('Toast Error:', options.title, options.description);
      } else {
        console.log('Toast:', options.title, options.description);
      }
    }
  };
};

export function ManageClassDialog({ 
  open, 
  onOpenChange, 
  classData, 
  onClassUpdated 
}: ManageClassDialogProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  // Safe toast hook with fallback
  let toastHook;
  try {
    // @ts-ignore - Dynamic import to avoid build issues
    const { useToast } = require("@/hooks/use-toast");
    toastHook = useToast();
  } catch (error) {
    console.warn("useToast hook not available, using fallback");
    toastHook = useToastFallback();
  }
  
  const { toast } = toastHook;

  // Don't render if classData is null and dialog shouldn't be open
  if (!classData && open) {
    return null;
  }

  const handleArchiveClass = async () => {
    if (!classData) return;
    
    setIsLoading("archive");
    try {
      const response = await apiClient.put(`/admin/classes/${classData.id}`, {
        status: "archived"
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Class archived successfully",
        });
        
        if (onClassUpdated) {
          onClassUpdated();
        }
        onOpenChange(false);
      } else {
        throw new Error(response.data.message || "Failed to archive class");
      }
    } catch (error: any) {
      console.error("Error archiving class:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to archive class",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleActivateClass = async () => {
    if (!classData) return;
    
    setIsLoading("activate");
    try {
      const response = await apiClient.put(`/admin/classes/${classData.id}`, {
        status: "active"
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Class activated successfully",
        });
        
        if (onClassUpdated) {
          onClassUpdated();
        }
      } else {
        throw new Error(response.data.message || "Failed to activate class");
      }
    } catch (error: any) {
      console.error("Error activating class:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to activate class",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleSuspendClass = async () => {
    if (!classData) return;
    
    setIsLoading("suspend");
    try {
      const response = await apiClient.put(`/admin/classes/${classData.id}`, {
        status: "suspended"
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Class suspended successfully",
        });
        
        if (onClassUpdated) {
          onClassUpdated();
        }
      } else {
        throw new Error(response.data.message || "Failed to suspend class");
      }
    } catch (error: any) {
      console.error("Error suspending class:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to suspend class",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleEditClassInfo = async () => {
    if (!classData) return;
    
    setIsLoading("edit");
    try {
      // This would typically open another dialog or form
      // For now, we'll simulate an API call
      const response = await apiClient.put(`/admin/classes/${classData.id}`, {
        name: classData.name,
        tutor: classData.tutor,
        // Include other editable fields
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Class information updated successfully",
        });
        
        if (onClassUpdated) {
          onClassUpdated();
        }
      } else {
        throw new Error(response.data.message || "Failed to update class");
      }
    } catch (error: any) {
      console.error("Error updating class:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update class information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleViewStudents = async () => {
    if (!classData) return;
    
    setIsLoading("students");
    try {
      // Fetch students for this class - you might need to create this endpoint
      const response = await apiClient.get(`/admin/classes/${classData.id}/students`);
      
      if (response.data.success) {
        const students = response.data.students || [];
        toast({
          title: "Students Loaded",
          description: `Found ${students.length} students in this class`,
        });
        // Here you would typically set state to show the students in a list
      } else {
        throw new Error(response.data.message || "Failed to fetch students");
      }
    } catch (error: any) {
      console.error("Error fetching students:", error);
      
      // If endpoint doesn't exist yet, show informative message
      if (error.response?.status === 404) {
        toast({
          title: "Feature Coming Soon",
          description: "Student management feature will be available soon",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load students",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(null);
    }
  };

  const handleViewMaterials = async () => {
    if (!classData) return;
    
    setIsLoading("materials");
    try {
      // Fetch materials for this class - you might need to create this endpoint
      const response = await apiClient.get(`/admin/classes/${classData.id}/materials`);
      
      if (response.data.success) {
        const materials = response.data.materials || [];
        toast({
          title: "Materials Loaded",
          description: `Found ${materials.length} materials for this class`,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch materials");
      }
    } catch (error: any) {
      console.error("Error fetching materials:", error);
      
      // If endpoint doesn't exist yet, show informative message
      if (error.response?.status === 404) {
        toast({
          title: "Feature Coming Soon",
          description: "Materials management feature will be available soon",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load materials",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800 border-green-200",
      archived: "bg-gray-100 text-gray-800 border-gray-200",
      suspended: "bg-red-100 text-red-800 border-red-200",
    };

    const colorClass = statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
      </span>
    );
  };

  const getStatusActions = () => {
    if (!classData) return null;

    switch (classData.status) {
      case "active":
        return (
          <Button 
            variant="outline" 
            className="justify-start gap-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
            onClick={handleSuspendClass}
            disabled={isLoading !== null}
          >
            {isLoading === "suspend" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PauseCircle className="w-4 h-4" />
            )}
            Suspend Class
          </Button>
        );
      case "suspended":
        return (
          <Button 
            variant="outline" 
            className="justify-start gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={handleActivateClass}
            disabled={isLoading !== null}
          >
            {isLoading === "activate" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4" />
            )}
            Activate Class
          </Button>
        );
      case "archived":
        return (
          <Button 
            variant="outline" 
            className="justify-start gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={handleActivateClass}
            disabled={isLoading !== null}
          >
            {isLoading === "activate" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4" />
            )}
            Restore Class
          </Button>
        );
      default:
        return null;
    }
  };

  // Safe class data with fallbacks
  const safeClassData = classData || {
    id: "",
    name: "Unknown Class",
    tutor: "Unknown Tutor",
    students: 0,
    rating: 0,
    status: "active" as const
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {safeClassData.name}
            {getStatusBadge(safeClassData.status)}
          </DialogTitle>
          <DialogDescription>
            Instructor: {safeClassData.tutor}
            {safeClassData.created_at && (
              <span className="block text-xs mt-1">
                Created: {new Date(safeClassData.created_at).toLocaleDateString()}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-xl font-semibold">{safeClassData.students || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
              <FileText className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-xl font-semibold">⭐ {safeClassData.rating || 0}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Management Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="justify-start gap-2"
                onClick={handleViewStudents}
                disabled={isLoading !== null}
              >
                {isLoading === "students" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Users className="w-4 h-4" />
                )}
                View Students
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start gap-2"
                onClick={handleViewMaterials}
                disabled={isLoading !== null}
              >
                {isLoading === "materials" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                View Materials
              </Button>
              
              {getStatusActions()}
              
              <Button 
                variant="outline" 
                className="justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleArchiveClass}
                disabled={isLoading !== null || safeClassData.status === "archived"}
              >
                {isLoading === "archive" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
                {safeClassData.status === "archived" ? "Archived" : "Archive Class"}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={handleEditClassInfo}
              disabled={isLoading !== null}
            >
              {isLoading === "edit" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Edit Class Info
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Analytics feature will be available soon",
                });
              }}
              disabled={isLoading !== null}
            >
              View Analytics
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}