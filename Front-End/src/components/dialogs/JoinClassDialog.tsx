import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface JoinClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinClassDialog({ open, onOpenChange }: JoinClassDialogProps) {
  const [classCode, setClassCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinClass = () => {
    if (!classCode.trim()) {
      toast.error("Please enter a class code");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      toast.success("Successfully joined the class!");
      setClassCode("");
      setIsLoading(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="animate-scale-in">
        <DialogHeader>
          <DialogTitle>Join a Class</DialogTitle>
          <DialogDescription>Enter the class code provided by your tutor</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="classCode">Class Code</Label>
            <Input
              id="classCode"
              placeholder="e.g., ABC123XYZ"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              className="text-lg font-mono"
            />
          </div>

          <Button 
            onClick={handleJoinClass} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Joining..." : "Join Class"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
