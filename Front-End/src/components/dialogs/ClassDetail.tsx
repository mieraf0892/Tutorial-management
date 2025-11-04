import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import {  Users, FileText  } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ClassDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: {
    name: string;
    tutor: string;
    students: number;
    progress: number;
    assignments: number;
    description?: string;
  };
}

export function ClassDetailDialog({ open, onOpenChange, classData }: ClassDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-2xl">{classData.name}</DialogTitle>
          <DialogDescription>Instructor: {classData.tutor}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-xl font-semibold">{classData.students}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
              <FileText className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Assignments</p>
                <p className="text-xl font-semibold">{classData.assignments}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Your Progress</span>
              <span className="text-sm font-medium text-primary">{classData.progress}%</span>
            </div>
            <Progress value={classData.progress} className="h-3" />
          </div>

          <div>
            <h3 className="font-semibold mb-2">About this class</h3>
            <p className="text-sm text-muted-foreground">
              {classData.description || "Learn essential skills and concepts to master this subject. Engage with interactive content and practical assignments."}
            </p>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1">View Materials</Button>
            <Button variant="outline" className="flex-1">Class Stream</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
