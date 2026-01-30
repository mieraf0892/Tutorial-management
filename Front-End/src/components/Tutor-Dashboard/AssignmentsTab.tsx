// components/Tutor-Dashboard/AssignmentsTab.tsx - SIMPLIFIED VERSION
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
  Users,
  Calendar,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Types for the new assignment system
interface BaseAssignment {
  id: number;
  type: 'individual' | 'class';
  status: string;
  tutor_status: 'pending' | 'accepted' | 'rejected';
  tutor_responded_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface IndividualAssignment extends BaseAssignment {
  type: 'individual';
  student_id: number;
  student_name: string;
  student_email: string;
  student_avatar: string | null;
  course_id: number;
  course_title: string;
  course_description: string;
  course_duration: number;
  weekly_hours: number;
  start_date: string;
  end_date: string | null;
}

interface ClassAssignment extends BaseAssignment {
  type: 'class';
  title: string;
  description: string;
  batch_name: string;
  enrollment_code: string;
  current_enrollment: number;
  max_capacity: number;
  schedule: string;
  start_date: string;
  end_date: string;
  price: string;
  level: string;
  course_id: number;
  course_title: string;
  course_description: string;
  course_duration: number;
}

interface AssignmentsData {
  pending: {
    individual: IndividualAssignment[];
    classes: ClassAssignment[];
    count: number;
  };
  accepted: {
    individual: IndividualAssignment[];
    classes: ClassAssignment[];
    count: number;
  };
  rejected: {
    individual: IndividualAssignment[];
    classes: ClassAssignment[];
    count: number;
  };
  stats: {
    total_individual: number;
    total_classes: number;
    total_pending: number;
    total_accepted: number;
    total_rejected: number;
  };
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
  const [assignments, setAssignments] = useState<AssignmentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<number | null>(null);
  const [selectedRejectType, setSelectedRejectType] = useState<'individual' | 'class'>('individual');
  const [rejectionReason, setRejectionReason] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    pending: true,
    accepted: false,
    rejected: false
  });

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/tutor/assignments");
      
      if (response.data.success && response.data.data) {
        setAssignments(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to load assignments");
      }
    } catch (error: any) {
      console.error("Error fetching assignments:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load assignments",
        variant: "destructive",
      });
      // Set empty data on error
      setAssignments({
        pending: { individual: [], classes: [], count: 0 },
        accepted: { individual: [], classes: [], count: 0 },
        rejected: { individual: [], classes: [], count: 0 },
        stats: {
          total_individual: 0,
          total_classes: 0,
          total_pending: 0,
          total_accepted: 0,
          total_rejected: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleAccept = async (id: number, type: 'individual' | 'class') => {
    try {
      setProcessingId(id);
      const response = await apiClient.post(`/tutor/assignments/${id}/accept?type=${type}`);
      
      if (response.data.success) {
        toast({
          title: "✅ Accepted",
          description: response.data.message,
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
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRejectId || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingId(selectedRejectId);
      const response = await apiClient.post(
        `/tutor/assignments/${selectedRejectId}/reject?type=${selectedRejectType}`,
        { reason: rejectionReason }
      );
      
      if (response.data.success) {
        toast({
          title: "❌ Rejected",
          description: response.data.message,
        });
        setRejectDialogOpen(false);
        setRejectionReason('');
        setSelectedRejectId(null);
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
      setProcessingId(null);
    }
  };

  const openRejectDialog = (id: number, type: 'individual' | 'class') => {
    setSelectedRejectId(id);
    setSelectedRejectType(type);
    setRejectDialogOpen(true);
  };

  const getStatusBadge = (status: string, tutorStatus: string) => {
    if (tutorStatus === 'pending') {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      );
    }
    
    if (tutorStatus === 'accepted') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Accepted
        </Badge>
      );
    }
    
    if (tutorStatus === 'rejected') {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    }
    
    return <Badge variant="outline">{status}</Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const AssignmentCard = ({ assignment }: { assignment: IndividualAssignment | ClassAssignment }) => {
    const isIndividual = assignment.type === 'individual';
    const isPending = assignment.tutor_status === 'pending';
    
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base line-clamp-1">
                {isIndividual 
                  ? assignment.course_title
                  : assignment.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isIndividual ? (
                  <>
                    <User className="w-3 h-3" />
                    <span>{assignment.student_name}</span>
                    <span className="text-xs">• {assignment.student_email}</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3 h-3" />
                    <span>{assignment.current_enrollment}/{assignment.max_capacity} students</span>
                    <span className="text-xs">• {assignment.batch_name}</span>
                  </>
                )}
              </div>
            </div>
            {getStatusBadge(assignment.status, assignment.tutor_status)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {isIndividual ? assignment.course_description : assignment.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3 h-3" />
                <span className="font-medium">Course:</span>
                <span className="truncate">{assignment.course_title}</span>
              </div>
              {isIndividual ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {assignment.weekly_hours} hrs/week
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>{assignment.schedule}</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>Starts: {formatDate(assignment.start_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Created {getTimeAgo(assignment.created_at)}
                </span>
              </div>
            </div>
          </div>

          {isPending && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button
                size="sm"
                onClick={() => handleAccept(assignment.id, assignment.type)}
                disabled={processingId === assignment.id}
                className="flex-1"
              >
                {processingId === assignment.id ? (
                  <>Processing...</>
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
                onClick={() => openRejectDialog(assignment.id, assignment.type)}
                disabled={processingId === assignment.id}
                className="flex-1"
              >
                {processingId === assignment.id ? (
                  <>Processing...</>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
            </div>
          )}

          {assignment.tutor_status === 'accepted' && (
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Accepted on: {assignment.tutor_responded_at ? formatDate(assignment.tutor_responded_at) : 'N/A'}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  toast({
                    title: "Next Steps",
                    description: isIndividual 
                      ? `Now create tutorials for ${assignment.course_title} for ${assignment.student_name}`
                      : `Now create tutorials for ${assignment.course_title} class`,
                  });
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Tutorial Content
              </Button>
            </div>
          )}

          {assignment.tutor_status === 'rejected' && assignment.rejection_reason && (
            <div className="pt-2 border-t">
              <div className="text-sm">
                <span className="font-medium">Rejection Reason:</span>
                <p className="mt-1 text-red-600 bg-red-50 p-2 rounded text-sm">
                  {assignment.rejection_reason}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
        <div className="text-muted-foreground">Loading assignments...</div>
      </div>
    );
  }

  // Safe defaults
  const assignmentsData = assignments || {
    pending: { individual: [], classes: [], count: 0 },
    accepted: { individual: [], classes: [], count: 0 },
    rejected: { individual: [], classes: [], count: 0 },
    stats: {
      total_individual: 0,
      total_classes: 0,
      total_pending: 0,
      total_accepted: 0,
      total_rejected: 0
    }
  };

  const { pending, accepted, rejected, stats } = assignmentsData;

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Assignments</h2>
          <p className="text-muted-foreground">
            Manage your individual and class assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchAssignments}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats - FIXED with safe access */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">
                  {(stats?.total_individual || 0) + (stats?.total_classes || 0)}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Individual</p>
                <p className="text-2xl font-bold">{stats?.total_individual || 0}</p>
              </div>
              <User className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Classes</p>
                <p className="text-2xl font-bold">{stats?.total_classes || 0}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats?.total_pending || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">{stats?.total_accepted || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Assignments Section - SIMPLIFIED without Collapsible */}
      <div className="space-y-4">
        <div 
          className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg cursor-pointer"
          onClick={() => toggleSection('pending')}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Pending Review</h3>
            <Badge variant="secondary">{pending?.count || 0}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {expandedSections.pending ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
        
        {expandedSections.pending && (
          <div>
            {pending?.count === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-48">
                  <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Pending Assignments</h3>
                  <p className="text-muted-foreground text-center">
                    You don't have any assignments waiting for your review.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Individual Assignments */}
                {pending?.individual && pending.individual.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Individual Students ({pending.individual.length})
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {pending.individual.map((assignment) => (
                        <AssignmentCard key={`individual-${assignment.id}`} assignment={assignment} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Classes */}
                {pending?.classes && pending.classes.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Classes ({pending.classes.length})
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {pending.classes.map((assignment) => (
                        <AssignmentCard key={`class-${assignment.id}`} assignment={assignment} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accepted Assignments Section */}
      {accepted?.count && accepted.count > 0 && (
        <div className="space-y-4">
          <div 
            className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg cursor-pointer"
            onClick={() => toggleSection('accepted')}
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold">Accepted Assignments</h3>
              <Badge variant="secondary">{accepted.count}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {expandedSections.accepted ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
          
          {expandedSections.accepted && (
            <div className="space-y-4">
              {accepted?.individual && accepted.individual.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Individual Students ({accepted.individual.length})
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {accepted.individual.map((assignment) => (
                      <AssignmentCard key={`individual-${assignment.id}`} assignment={assignment} />
                    ))}
                  </div>
                </div>
              )}
              
              {accepted?.classes && accepted.classes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Classes ({accepted.classes.length})
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {accepted.classes.map((assignment) => (
                      <AssignmentCard key={`class-${assignment.id}`} assignment={assignment} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rejected Assignments Section */}
      {rejected?.count && rejected.count > 0 && (
        <div className="space-y-4">
          <div 
            className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg cursor-pointer"
            onClick={() => toggleSection('rejected')}
          >
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold">Rejected Assignments</h3>
              <Badge variant="secondary">{rejected.count}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {expandedSections.rejected ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
          
          {expandedSections.rejected && (
            <div className="space-y-4">
              {rejected?.individual && rejected.individual.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Individual Students ({rejected.individual.length})
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {rejected.individual.map((assignment) => (
                      <AssignmentCard key={`individual-${assignment.id}`} assignment={assignment} />
                    ))}
                  </div>
                </div>
              )}
              
              {rejected?.classes && rejected.classes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Classes ({rejected.classes.length})
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {rejected.classes.map((assignment) => (
                      <AssignmentCard key={`class-${assignment.id}`} assignment={assignment} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Assignment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this assignment. This will be sent to the admin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Reason for Rejection *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Explain why you cannot accept this assignment..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters. Be professional and clear.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectionReason.trim() || processingId === selectedRejectId}
              variant="destructive"
            >
              {processingId === selectedRejectId ? (
                <>Rejecting...</>
              ) : (
                <>Reject Assignment</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}