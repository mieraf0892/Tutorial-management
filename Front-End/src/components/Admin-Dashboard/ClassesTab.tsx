// components/admin-dashboard/ClassesTab.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, BookOpen, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

// Update interface to match API response
interface ClassItem {
  id: number;
  title: string;
  name: string; // For compatibility
  description: string;
  tutor: string;
  tutor_details?: {
    id: number;
    name: string;
    email: string;
  };
  students: number;
  max_capacity: number;
  rating: number;
  subject: string;
  category?: {
    id: number;
    name: string;
    color: string;
  };
  color: string;
  enrollmentCode: string;
  assignments: number;
  active: boolean;
  completionRate: number;
  duration: string;
  level: string;
  price: number;
  created_at: string;
  updated_at: string;
}

interface ClassesTabProps {
  classes: ClassItem[];
  onSelectClass: (classItem: ClassItem) => void;
  searchQuery: string;
  onRefresh?: () => void;
  onCreateClass?: () => void;
}

export default function ClassesTab({ 
  classes, 
  onSelectClass, 
  searchQuery, 
  onRefresh,
  onCreateClass
}: ClassesTabProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  
  // Filter classes based on search query
  const filteredClasses = classes.filter(classItem => 
    classItem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.tutor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.enrollmentCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateClass = async () => {
    if (onCreateClass) {
      onCreateClass(); // Call the parent function to open dialog
      return;
    }
    
    // Fallback to toast if no onCreateClass provided
    toast({
      title: "Create Class",
      description: "Create class functionality will be added next.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">All Classes</h2>
          <p className="text-muted-foreground">Manage and monitor all platform classes</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              className="flex-1 sm:flex-none bg-card hover:bg-accent border-border"
              disabled={isCreating}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          )}
          <Button 
            size="sm" 
            className="flex-1 sm:flex-none"
            onClick={handleCreateClass}
            disabled={isCreating}
          >
            <Plus className="w-4 h-4 mr-1" />
            {isCreating ? "Creating..." : "Create Class"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{classes.length}</div>
            <p className="text-sm text-muted-foreground">Total Classes</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {classes.filter(c => c.active).length}
            </div>
            <p className="text-sm text-muted-foreground">Active Classes</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {classes.reduce((sum, c) => sum + c.students, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {classes.length > 0 
                ? Math.round(classes.reduce((sum, c) => sum + c.completionRate, 0) / classes.length)
                : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Avg Completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Search results info */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground bg-card border border-border rounded-lg p-3">
          Showing {filteredClasses.length} of {classes.length} classes matching "{searchQuery}"
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.length > 0 ? (
          filteredClasses.map((classItem) => (
            <ClassCard 
              key={classItem.id} 
              classItem={classItem}
              onSelect={onSelectClass}
              onRefresh={onRefresh}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 border-2 border-dashed border-border rounded-lg bg-card">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? "No classes found" : "No classes available"}
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {searchQuery 
                ? "Try adjusting your search terms or check for spelling errors" 
                : "Get started by creating your first class to organize tutorials and students"
              }
            </p>
            <Button onClick={handleCreateClass} disabled={isCreating}>
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? "Creating..." : "Create Class"}
            </Button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredClasses.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="text-muted-foreground">
                Total: {filteredClasses.length} class{filteredClasses.length !== 1 ? 'es' : ''}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">
                    {filteredClasses.filter(c => c.active).length} Active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-muted-foreground">
                    {filteredClasses.filter(c => !c.active).length} Archived
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ClassCard({ 
  classItem, 
  onSelect,
  onRefresh
}: { 
  classItem: ClassItem;
  onSelect: (classItem: ClassItem) => void;
  onRefresh?: () => void;
}) {
  const { toast } = useToast();
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setIsArchiving(true);
      await apiClient.delete(`/admin/classes/${classItem.id}`);
      
      toast({
        title: "Class Archived",
        description: `${classItem.title} has been archived successfully.`,
      });
      
      onRefresh?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to archive class",
        variant: "destructive",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleActivate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setIsArchiving(true);
      await apiClient.put(`/admin/classes/${classItem.id}`, {
        is_published: true
      });
      
      toast({
        title: "Class Activated",
        description: `${classItem.title} has been activated successfully.`,
      });
      
      onRefresh?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to activate class",
        variant: "destructive",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  // Ensure color class works in dark mode
  const getColorClass = (color: string) => {
    // If it's a Tailwind color class, add dark mode variant
    if (color.includes('bg-') && !color.includes('dark:')) {
      // Map light colors to darker variants for dark mode
      const colorMap: { [key: string]: string } = {
        'bg-blue-500': 'dark:bg-blue-600',
        'bg-green-500': 'dark:bg-green-600',
        'bg-purple-500': 'dark:bg-purple-600',
        'bg-orange-500': 'dark:bg-orange-600',
        'bg-red-500': 'dark:bg-red-600',
        'bg-indigo-500': 'dark:bg-indigo-600',
        'bg-teal-500': 'dark:bg-teal-600',
        'bg-pink-500': 'dark:bg-pink-600',
        'bg-yellow-500': 'dark:bg-yellow-600',
      };
      
      const darkColor = colorMap[color] || 'dark:bg-gray-600';
      return `${color} ${darkColor}`;
    }
    return color;
  };

  return (
    <Card 
      className="border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer group bg-card"
      onClick={() => onSelect(classItem)}
    >
      <div className={`${getColorClass(classItem.color)} h-24 rounded-t-lg relative transition-colors`}>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="font-bold text-lg group-hover:underline">{classItem.title}</h3>
          <p className="text-white/90 text-sm">{classItem.subject}</p>
        </div>
        <Badge 
          variant={classItem.active ? "default" : "secondary"}
          className="absolute top-4 right-4 bg-white/20 dark:bg-black/20 text-white border-white/30 dark:border-white/20 backdrop-blur-sm"
        >
          {classItem.active ? 'Active' : 'Archived'}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
            <span className="truncate" title={classItem.tutor}>
              👨‍🏫 {classItem.tutor}
            </span>
            <span className="font-mono bg-muted px-2 py-1 rounded text-xs border border-border">
              {classItem.enrollmentCode}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Completion Rate</span>
              <span className="font-semibold text-foreground">{classItem.completionRate}%</span>
            </div>
            <Progress value={classItem.completionRate} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm pt-2">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1" title={`${classItem.students} students`}>
                <Users className="w-4 h-4" />
                {classItem.students}/{classItem.max_capacity}
              </span>
              <span className="flex items-center gap-1" title={`${classItem.assignments} assignments`}>
                <BookOpen className="w-4 h-4" />
                {classItem.assignments}
              </span>
            </div>
            
            <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
              ⭐ {classItem.rating.toFixed(1)}
            </Badge>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              className="flex-1 group-hover:bg-primary/90 transition-colors" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(classItem);
              }}
            >
              Manage Class
            </Button>
            
            {classItem.active ? (
              <Button 
                variant="outline"
                size="sm"
                onClick={handleArchive}
                disabled={isArchiving}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
              >
                {isArchiving ? "..." : "Archive"}
              </Button>
            ) : (
              <Button 
                variant="outline"
                size="sm"
                onClick={handleActivate}
                disabled={isArchiving}
                className="text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
              >
                {isArchiving ? "..." : "Activate"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}