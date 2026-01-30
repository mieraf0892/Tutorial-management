// src/components/Admin-Dashboard/CourseTutorialsDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Clock, CheckCircle, XCircle, FileText, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Tutorial {
  id: number;
  title: string;
  description?: string;
  status: string;
  batch_name?: string;
  level?: string;
  duration_hours?: number;
  created_at: string;
  approved_at?: string;
  tutor_name?: string; // we'll add this in response if possible
}

interface CourseTutorialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number;
  courseTitle: string;
}

export default function CourseTutorialsDialog({
  open,
  onOpenChange,
  courseId,
  courseTitle,
}: CourseTutorialsDialogProps) {
  const { toast } = useToast();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !courseId) return;

    const fetchTutorials = async () => {
      setLoading(true);
      try {
        // You can use /admin/tutorials?course_id=... or create a new endpoint
        // For now assuming we extend /admin/tutorials with ?course_id
        const res = await apiClient.get("/admin/tutorials", {
          params: { course_id: courseId },
        });

        if (res.data.success) {
          setTutorials(res.data.tutorials || []);
        }
      } catch (err: any) {
        toast({
          title: "Error",
          description: "Failed to load tutorials for this course",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, [open, courseId, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
      case "pending_approval":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Tutorials in: {courseTitle}
          </DialogTitle>
          <DialogDescription>
            All content packages (tutorials) associated with this course.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading tutorials...
          </div>
        ) : tutorials.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No tutorials yet</p>
            <p className="text-sm text-muted-foreground">
              Tutors have not created any content packages for this course.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 py-2">
              {tutorials.map((tut) => (
                <div
                  key={tut.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 flex-1">
                      <h4 className="font-medium">{tut.title}</h4>
                      {tut.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tut.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                        {tut.batch_name && <span>Batch: {tut.batch_name}</span>}
                        {tut.level && <span>Level: {tut.level}</span>}
                        {tut.duration_hours && <span>{tut.duration_hours}h</span>}
                        {tut.tutor_name && <span>Tutor: {tut.tutor_name}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(tut.status)}
                      {tut.approved_at && (
                        <span className="text-xs text-muted-foreground">
                          Approved {new Date(tut.approved_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}