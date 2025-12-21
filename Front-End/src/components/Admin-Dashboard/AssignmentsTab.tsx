// components/Admin-Dashboard/AssignmentsTab.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  BookOpen,
  Users,
  ArrowRight
} from "lucide-react";

interface Assignment {
  id: number;
  tutorial_id: number;
  tutor_id: number;
  tutor_name: string;
  tutorial_title: string;
  status: 'pending' | 'accepted' | 'rejected';
  assigned_by_admin_id: number;
  assigned_by_name: string;
  created_at: string;
  accepted_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  tutorial: {
    id: number;
    title: string;
    status: string;
    category?: {
      name: string;
    };
  };
}

export default function AssignmentsTab() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/assignments");
      if (response.data.success) {
        setAssignments(response.data.assignments || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAssignment = async (assignmentId: number) => {
    // Actually tutors accept assignments, not admins
    // This is just for viewing
    toast({
      title: "Info",
      description: "Tutors accept assignments from their dashboard",
    });
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading assignments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tutorial Assignments</h2>
          <p className="text-muted-foreground">
            Manage tutorial assignments to tutors
          </p>
        </div>
        <Button onClick={fetchAssignments} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.filter(a => a.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Waiting for tutor acceptance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.filter(a => a.status === 'accepted').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.filter(a => a.status === 'rejected').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Declined by tutors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>
            Tutorials assigned to tutors and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No assignments found
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{assignment.tutorial_title}</span>
                      <Badge
                        variant={
                          assignment.status === 'accepted' ? 'default' :
                          assignment.status === 'rejected' ? 'destructive' : 'secondary'
                        }
                      >
                        {assignment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Tutor: {assignment.tutor_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Assigned by: {assignment.assigned_by_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(assignment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {assignment.rejection_reason && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        Reason: {assignment.rejection_reason}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 sm:mt-0">
                    {assignment.status === 'pending' && (
                      <Button variant="outline" size="sm" className="gap-1">
                        <Clock className="w-3 h-3" />
                        Waiting
                      </Button>
                    )}
                    {assignment.status === 'accepted' && (
                      <Button variant="default" size="sm" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Accepted
                      </Button>
                    )}
                    {assignment.status === 'rejected' && (
                      <Button variant="destructive" size="sm" className="gap-1">
                        <XCircle className="w-3 h-3" />
                        Rejected
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}