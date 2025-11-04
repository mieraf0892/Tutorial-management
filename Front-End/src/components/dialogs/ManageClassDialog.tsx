import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, FileText, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ManageClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: {
    name: string;
    tutor: string;
    students: number;
    rating: number;
  };
}

export function ManageClassDialog({ open, onOpenChange, classData }: ManageClassDialogProps) {
  const handleAction = (action: string) => {
    toast.success(`${action} action performed`);
  };

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
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-xl font-semibold">⭐ {classData.rating}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Management Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="justify-start gap-2"
                onClick={() => handleAction("View students")}
              >
                <Users className="w-4 h-4" />
                View Students
              </Button>
              <Button 
                variant="outline" 
                className="justify-start gap-2"
                onClick={() => handleAction("View materials")}
              >
                <FileText className="w-4 h-4" />
                View Materials
              </Button>
              <Button 
                variant="outline" 
                className="justify-start gap-2"
                onClick={() => handleAction("Class settings")}
              >
                <Settings className="w-4 h-4" />
                Class Settings
              </Button>
              <Button 
                variant="outline" 
                className="justify-start gap-2 text-destructive hover:text-destructive"
                onClick={() => handleAction("Archive class")}
              >
                <Trash2 className="w-4 h-4" />
                Archive Class
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1">Edit Class Info</Button>
            <Button variant="outline" className="flex-1">View Analytics</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
