import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  BookOpen,
  DollarSign,
  Calendar,
  AlertCircle,
  Globe,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface Assignment {
  id: number;
  tutorial_id: number;
  tutor_id: number;
  assigned_by_admin_id: number | null;
  status: 'pending' | 'accepted' | 'rejected';
  accepted_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  tutorial: {
    id: number;
    title: string;
    description: string;
    category: {
      id: number;
      name: string;
    };
    level: string;
    price: string;
    duration: string;
    status: string;
    is_published: boolean;
    created_by_role: 'admin' | 'tutor';
  };
  assigned_by: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface AssignmentsTabProps {
  onAssignmentAccepted?: () => void;
  onAssignmentRejected?: () => void;
}

export default function AssignmentsTab({ 
  onAssignmentAccepted, 
  onAssignmentRejected 
}: AssignmentsTabProps) {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/tutor/assignments");
      if (response.data.success) {
        setAssignments(response.data.assignments || []);
      }
    } catch (error: any) {
      console.error("Error fetching assignments:", error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleAccept = async (assignmentId: number) => {
    try {
      setAcceptingId(assignmentId);
      const response = await apiClient.post(`/tutor/assignments/${assignmentId}/accept`);
      
      if (response.data.success) {
        toast({
          title: "Accepted",
          description: "Assignment accepted successfully",
        });
        fetchAssignments();
        onAssignmentAccepted?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to accept assignment",
        variant: "destructive",
      });
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (assignmentId: number) => {
    const reason = prompt("Please provide a reason for rejecting this assignment:");
    if (!reason) return;

    try {
      setRejectingId(assignmentId);
      const response = await apiClient.post(`/tutor/assignments/${assignmentId}/reject`, {
        reason
      });
      
      if (response.data.success) {
        toast({
          title: "Rejected",
          description: "Assignment has been rejected",
        });
        fetchAssignments();
        onAssignmentRejected?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject assignment",
        variant: "destructive",
      });
    } finally {
      setRejectingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      accepted: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200"
    };
    
    return (
      <Badge variant="outline" className={`capitalize ${variants[status as keyof typeof variants]}`}>
        {status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
        {status === 'accepted' && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
        {status}
      </Badge>
    );
  };

  const getTutorialStatusBadge = (status: string) => {
    const variants = {
      draft: "bg-gray-100 text-gray-800 border-gray-200",
      pending_approval: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-blue-100 text-blue-800 border-blue-200",
      published: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      archived: "bg-gray-100 text-gray-800 border-gray-300"
    };
    
    return (
      <Badge variant="outline" className={`capitalize ${variants[status as keyof typeof variants] || 'bg-gray-100'}`}>
        {status}
      </Badge>
    );
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const acceptedAssignments = assignments.filter(a => a.status === 'accepted');
  const rejectedAssignments = assignments.filter(a => a.status === 'rejected');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Assignments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Assignments ({pendingAssignments.length})
          </h2>
          <Button variant="outline" onClick={fetchAssignments}>
            Refresh
          </Button>
        </div>

        {pendingAssignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Pending Assignments</h3>
              <p className="text-muted-foreground text-center">
                You don't have any pending assignments right now.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingAssignments.map((assignment) => (
              <Card key={assignment.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base line-clamp-1">
                        {assignment.tutorial.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>
                          {assignment.assigned_by 
                            ? `Assigned by: ${assignment.assigned_by.name}`
                            : "Self-created"
                          }
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(assignment.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {assignment.tutorial.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3 h-3" />
                        <span>{assignment.tutorial.category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3 h-3" />
                        <span>${assignment.tutorial.price}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Level:</span>
                        <Badge variant="outline" className="capitalize">
                          {assignment.tutorial.level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{getTimeAgo(assignment.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(assignment.id)}
                      disabled={acceptingId === assignment.id}
                      className="flex-1"
                    >
                      {acceptingId === assignment.id ? (
                        <>Accepting...</>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Assignment
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(assignment.id)}
                      disabled={rejectingId === assignment.id}
                      className="flex-1"
                    >
                      {rejectingId === assignment.id ? (
                        <>Rejecting...</>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Accepted Assignments */}
      {acceptedAssignments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Accepted Assignments ({acceptedAssignments.length})
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {acceptedAssignments.map((assignment) => (
              <Card key={assignment.id} className="overflow-hidden border-green-100">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base line-clamp-1">
                        {assignment.tutorial.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          assignment.tutorial.created_by_role === 'admin' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {assignment.tutorial.created_by_role === 'admin' 
                            ? 'Assigned by Admin' 
                            : 'Self-created'}
                        </span>
                        {getTutorialStatusBadge(assignment.tutorial.status)}
                      </div>
                    </div>
                    {getStatusBadge(assignment.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Accepted on:</span>
                      <span>{assignment.accepted_at 
                        ? new Date(assignment.accepted_at).toLocaleDateString()
                        : 'N/A'
                      }</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tutorial Status:</span>
                      {getTutorialStatusBadge(assignment.tutorial.status)}
                    </div>
                    
                    {assignment.tutorial.status === 'approved' && (
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          toast({
                            title: "Publish Tutorial",
                            description: `Publish "${assignment.tutorial.title}" to make it available to students`,
                          });
                          // You would add publish functionality here
                        }}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Publish Tutorial
                      </Button>
                    )}
                    
                    {assignment.tutorial.status === 'published' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => {
                          toast({
                            title: "View Tutorial",
                            description: `"${assignment.tutorial.title}" is live for students`,
                          });
                        }}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        View Live Tutorial
                      </Button>
                    )}
                    
                    {(assignment.tutorial.status === 'draft' || assignment.tutorial.status === 'approved') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => {
                          toast({
                            title: "Edit Content",
                            description: `Add lessons and materials to "${assignment.tutorial.title}"`,
                          });
                        }}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Create Content
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Assignments */}
      {rejectedAssignments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Rejected Assignments ({rejectedAssignments.length})
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rejectedAssignments.map((assignment) => (
              <Card key={assignment.id} className="overflow-hidden border-red-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-1">
                      {assignment.tutorial.title}
                    </CardTitle>
                    {getStatusBadge(assignment.status)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rejected on:</span>
                      <span>{assignment.rejected_at 
                        ? new Date(assignment.rejected_at).toLocaleDateString()
                        : 'N/A'
                      }</span>
                    </div>
                    {assignment.rejection_reason && (
                      <div>
                        <span className="text-muted-foreground">Reason:</span>
                        <p className="mt-1 text-red-600 bg-red-50 p-2 rounded">
                          {assignment.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}