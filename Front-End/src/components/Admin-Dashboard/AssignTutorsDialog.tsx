// src/components/Admin-Dashboard/AssignTutorsDialog.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface Tutor {
  id: number;
  name: string;
  email?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number;
  courseTitle: string;
  onAssigned: () => void;
}

export default function AssignTutorsDialog({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  onAssigned,
}: Props) {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutors, setSelectedTutors] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Fetch all active tutors
  useEffect(() => {
    if (open) {
      const fetchTutors = async () => {
        setLoading(true);
        try {
          const res = await apiClient.get('/admin/tutors');
          if (res.data.success) {
            setTutors(res.data.tutors || []);
          }
        } catch (err: any) {
          toast.error("Failed to load tutors");
        } finally {
          setLoading(false);
        }
      };
      fetchTutors();
    }
  }, [open]);

  // Filter tutors by search
  const filteredTutors = tutors.filter(tutor =>
    tutor.name.toLowerCase().includes(search.toLowerCase()) ||
    (tutor.email && tutor.email.toLowerCase().includes(search.toLowerCase()))
  );

  // Toggle tutor selection
  const toggleTutor = (tutorId: number) => {
    setSelectedTutors(prev =>
      prev.includes(tutorId)
        ? prev.filter(id => id !== tutorId)
        : [...prev, tutorId]
    );
  };

  const handleAssign = async () => {
    if (selectedTutors.length === 0) {
      toast.warning("Select at least one tutor");
      return;
    }

    setAssigning(true);
    try {
      const res = await apiClient.post(`/admin/courses/${courseId}/assign-tutors`, {
        tutor_ids: selectedTutors,
      });

      if (res.data.success) {
        toast.success(`Assigned ${selectedTutors.length} tutor(s) to "${courseTitle}"`);
        onAssigned();
        onOpenChange(false);
        setSelectedTutors([]); // reset
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to assign tutors");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Tutors to "{courseTitle}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div>
            <Input
              placeholder="Search tutors by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Tutors list */}
          {loading ? (
            <div className="text-center py-6">Loading tutors...</div>
          ) : filteredTutors.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No tutors found
            </div>
          ) : (
            <ScrollArea className="h-[300px] border rounded-md">
              <div className="space-y-2 p-2">
                {filteredTutors.map(tutor => (
                  <div
                    key={tutor.id}
                    className="flex items-center space-x-3 p-2 hover:bg-accent rounded cursor-pointer"
                    onClick={() => toggleTutor(tutor.id)}
                  >
                    <Checkbox
                      checked={selectedTutors.includes(tutor.id)}
                      onCheckedChange={() => toggleTutor(tutor.id)}
                    />
                    <div>
                      <Label className="font-medium">{tutor.name}</Label>
                      {tutor.email && (
                        <p className="text-sm text-muted-foreground">{tutor.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={assigning || selectedTutors.length === 0}>
            {assigning ? "Assigning..." : `Assign ${selectedTutors.length} Tutor${selectedTutors.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}