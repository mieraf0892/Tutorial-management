// components/Tutor-Dashboard/CreateSessionDialog.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Tutorial {
  id: number;
  title: string;
}

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionCreated: () => void;
  tutorials: Tutorial[];
}

export default function CreateSessionDialog({
  open,
  onOpenChange,
  onSessionCreated,
  tutorials = [],
}: CreateSessionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tutorial_id: "",
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    meeting_link: "",
    session_type: "regular",
    duration_minutes: 60,
    notes: "",
  });
  const { toast } = useToast();

  // Helper: format Date -> local "YYYY-MM-DDTHH:MM" for datetime-local inputs
  const toLocalDatetimeInputValue = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  // Calculate end time based on start time string (local) and duration (minutes)
  const calculateEndTime = (startTime: string, duration: number) => {
    if (!startTime) return "";
    // startTime is expected in "YYYY-MM-DDTHH:mm" (local) from datetime-local input
    const start = new Date(startTime);
    if (isNaN(start.getTime())) return "";
    const end = new Date(start.getTime() + duration * 60000);
    return toLocalDatetimeInputValue(end);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tutorial_id) {
      toast({
        title: "Error",
        description: "Please select a tutorial",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post(
        `/tutorials/${formData.tutorial_id}/sessions`,
        formData
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Session created successfully",
        });
        onSessionCreated();
        resetForm();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Create session error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tutorial_id: "",
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      meeting_link: "",
      session_type: "regular",
      duration_minutes: 60,
      notes: "",
    });
  };

  // Generic input handler with type coercion for duration_minutes
  const handleInputChange = (field: string, value: any) => {
    if (field === "duration_minutes") {
      const num = Number(value) || 0;
      setFormData((prev) => ({ ...prev, [field]: num }));
      // if start_time exists, update end_time immediately
      if (formData.start_time) {
        const endTime = calculateEndTime(formData.start_time, num);
        setFormData((prev) => ({ ...prev, end_time: endTime }));
      }
      return;
    }

    // For other fields just update
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStartTimeChange = (startTime: string) => {
    handleInputChange("start_time", startTime);
    if (startTime) {
      const endTime = calculateEndTime(startTime, Number(formData.duration_minutes));
      handleInputChange("end_time", endTime);
    } else {
      handleInputChange("end_time", "");
    }
  };

  const handleDurationChange = (duration: string) => {
    const durationNum = parseInt(duration, 10) || 0;
    handleInputChange("duration_minutes", durationNum);

    if (formData.start_time) {
      const endTime = calculateEndTime(formData.start_time, durationNum);
      handleInputChange("end_time", endTime);
    }
  };

  // Local min value for start_time (so min respects user's local time)
  const minStartTime = toLocalDatetimeInputValue(new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Schedule a new tutorial session for your students.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tutorial Selection */}
          <div className="space-y-2">
            <Label htmlFor="tutorial">Tutorial *</Label>
            <Select
              value={formData.tutorial_id}
              onValueChange={(value) => handleInputChange("tutorial_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a tutorial" />
              </SelectTrigger>
              <SelectContent>
                {tutorials.length > 0 ? (
                  tutorials.map((tutorial) => (
                    <SelectItem key={tutorial.id} value={tutorial.id.toString()}>
                      {tutorial.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-tutorials" disabled>
                    No tutorials available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {tutorials.length === 0 && (
              <p className="text-sm text-red-600">
                You need to create a tutorial first before creating sessions.
              </p>
            )}
          </div>

          {/* Session Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Session Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Introduction to React Hooks"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          {/* Session Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what will be covered in this session..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                required
                min={minStartTime}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
              <Select
                value={formData.duration_minutes.toString()}
                onValueChange={handleDurationChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Session Type */}
            <div className="space-y-2">
              <Label htmlFor="session_type">Session Type</Label>
              <Select
                value={formData.session_type}
                onValueChange={(value) => handleInputChange("session_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular Session</SelectItem>
                  <SelectItem value="makeup">Makeup Session</SelectItem>
                  <SelectItem value="extra">Extra Session</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Meeting Link */}
            <div className="space-y-2">
              <Label htmlFor="meeting_link">Meeting Link</Label>
              <Input
                id="meeting_link"
                type="url"
                placeholder="https://meet.google.com/..."
                value={formData.meeting_link}
                onChange={(e) => handleInputChange("meeting_link", e.target.value)}
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information for students..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || tutorials.length === 0}>
              {loading ? "Creating..." : "Create Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
