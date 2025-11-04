import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: {
    title: string;
    class: string;
    dueDate: string;
    status: string;
    description?: string;
  };
}

export function AssignmentDialog({ open, onOpenChange, assignment }: AssignmentDialogProps) {
  const [submission, setSubmission] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!submission.trim()) {
      toast.error("Please add your submission");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Assignment submitted successfully!");
      setSubmission("");
      setIsSubmitting(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-2xl">{assignment.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {assignment.class}
            <Badge variant={assignment.status === "completed" ? "default" : "secondary"}>
              Due in {assignment.dueDate}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <h3 className="font-semibold mb-2">Assignment Description</h3>
            <p className="text-sm text-muted-foreground">
              {assignment.description || "Complete the following tasks and submit your work before the deadline. Make sure to follow all guidelines and requirements."}
            </p>
          </div>

          {assignment.status !== "completed" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="submission">Your Work</Label>
                <Textarea
                  id="submission"
                  placeholder="Type your answer or add notes about your submission..."
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2">
                  <Upload className="w-4 h-4" />
                  Upload File
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Submit Assignment"}
                </Button>
              </div>
            </>
          )}

          {assignment.status === "completed" && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 text-primary mb-2">
                <FileText className="w-5 h-5" />
                <span className="font-semibold">Submitted</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your assignment has been submitted and is under review.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
