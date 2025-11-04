import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface GradeSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: {
    student: string;
    assignment: string;
    class: string;
  };
}

export function GradeSubmissionDialog({ open, onOpenChange, submission }: GradeSubmissionDialogProps) {
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGrade = () => {
    if (!grade.trim()) {
      toast.error("Please enter a grade");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Grade submitted successfully!");
      setGrade("");
      setFeedback("");
      setIsSubmitting(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-2xl">Grade Submission</DialogTitle>
          <DialogDescription>
            {submission.student} • {submission.assignment}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <h3 className="font-semibold mb-2">Student Submission</h3>
            <p className="text-sm text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Student's work content would appear here with attached files and answers.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline">View Files</Button>
              <Button size="sm" variant="outline">Download All</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade *</Label>
            <Input
              id="grade"
              type="number"
              placeholder="e.g., 95"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              min="0"
              max="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Provide feedback to the student..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGrade} 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Grade"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
