// components/Tutor-Dashboard/TutorialsTab.tsx - UPDATED STATUS MESSAGE SECTION
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  BookOpen, 
  Globe, 
  EyeOff,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  FileText,
  Users,
  Download,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Tutorial {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  student_count: number;
  total_sessions: number;
  completed_sessions: number;
  created_at: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'rejected' | 'archived';
  is_published?: boolean;
  created_by_role?: 'tutor' | 'admin';
  admin_id?: number;
  approved_by_admin_id?: number;
  approved_at?: string;
  rejection_reason?: string;
  course_id?: number;
  course_title?: string;
  batch_name?: string;
  schedule?: string;
  start_date?: string;
  duration_hours?: number;
  level?: string;
  learning_outcomes?: string[];
  requirements?: string[];
  instructor_bio?: string;
}

interface TutorialsTabProps {
  tutorials: Tutorial[];
  onTutorialUpdate?: () => void;
}

export default function TutorialsTab({ tutorials, onTutorialUpdate }: TutorialsTabProps) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const getStatusBadge = (tutorial: Tutorial) => {
    const status = tutorial.status ?? 'draft'; // or throw if undefined, but fallback to draft is fine
    
    switch (status) {
      case 'published':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </Badge>
        );
      case 'pending_approval':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending Approval
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
            <FileText className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
            {tutorial.rejection_reason && (
              <span className="ml-1" title={tutorial.rejection_reason}>⚠️</span>
            )}
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
            {tutorial.approved_at && (
              <span className="ml-1 text-xs">
                {new Date(tutorial.approved_at).toLocaleDateString()}
              </span>
            )}
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
            Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };

  const handleSubmitForApproval = async (tutorialId: number) => {
    try {
      setSubmittingId(tutorialId);
      const response = await apiClient.post(`/tutor/tutorials/${tutorialId}/submit-approval`);
      
      if (response.data.success) {
        toast({
          title: "Submitted!",
          description: "Tutorial submitted for admin approval. You'll be notified when reviewed.",
        });
        onTutorialUpdate?.();
      } else {
        throw new Error(response.data.message || "Failed to submit tutorial");
      }
    } catch (error: any) {
      console.error("Submit tutorial error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit tutorial for approval",
        variant: "destructive",
      });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleEditTutorial = (tutorialId: number) => {
    toast({
      title: "Edit Tutorial",
      description: `Editing tutorial #${tutorialId}`,
      action: (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(`/tutor/tutorials/${tutorialId}/edit`, '_blank')}
        >
          Open Editor
        </Button>
      ),
    });
  };

  const handleDeleteTutorial = async (tutorialId: number) => {
    if (!confirm("Are you sure you want to delete this tutorial content package? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(tutorialId);
      const response = await apiClient.delete(`/tutor/tutorials/${tutorialId}`);
      
      if (response.data.success) {
        toast({
          title: "Deleted!",
          description: "Tutorial content package deleted successfully",
        });
        onTutorialUpdate?.();
      } else {
        throw new Error(response.data.message || "Failed to delete tutorial");
      }
    } catch (error: any) {
      console.error("Delete tutorial error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete tutorial",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = (tutorialId: number) => {
    toast({
      title: "View Details",
      description: `Viewing tutorial #${tutorialId} details`,
    });
  };

  const handleDownloadContent = (tutorial: Tutorial) => {
    toast({
      title: "Download Content",
      description: `Downloading content package for "${tutorial.title}"`,
    });
  };

  const canEditTutorial = (tutorial: Tutorial) => {
    return ['draft', 'rejected'].includes(tutorial.status);
  };

  const canSubmitTutorial = (tutorial: Tutorial) => {
    return tutorial.status === 'draft';
  };

  const canDeleteTutorial = (tutorial: Tutorial) => {
    return ['draft', 'rejected'].includes(tutorial.status);
  };

  const getStatusMessage = (tutorial: Tutorial) => {
    switch (tutorial.status) {
      case 'draft':
        return "Save your work and submit for admin approval when ready.";
      case 'pending_approval':
        return "Waiting for admin review. You'll be notified when approved.";
      case 'approved':
        return "Approved by admin! This content is ready to be assigned to students.";
      case 'published':
        return "Published! This content is now available for student assignments.";
      case 'rejected':
        return tutorial.rejection_reason 
          ? `Rejected: ${tutorial.rejection_reason}`
          : "Rejected by admin. Please review and resubmit.";
      default:
        return "";
    }
  };

  // Filter tutorials for display
  const filteredTutorials = tutorials.filter(tutorial => {
    return tutorial.status !== 'archived';
  });

  // Group tutorials by status
  const publishedTutorials = filteredTutorials.filter(t => t.status === 'published');
  const approvedTutorials = filteredTutorials.filter(t => t.status === 'approved');
  const pendingTutorials = filteredTutorials.filter(t => t.status === 'pending_approval');
  const draftTutorials = filteredTutorials.filter(t => t.status === 'draft');
  const rejectedTutorials = filteredTutorials.filter(t => t.status === 'rejected');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Content Packages</h2>
          <p className="text-muted-foreground">
            Create, manage, and submit tutorial content for admin approval
          </p>
        </div>
        {onTutorialUpdate && (
          <Button variant="outline" onClick={onTutorialUpdate} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        )}
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold">{publishedTutorials.length}</div>
          <div className="text-sm text-muted-foreground">Published</div>
          <div className="text-xs text-green-600 mt-1">Ready for students</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold">{approvedTutorials.length}</div>
          <div className="text-sm text-muted-foreground">Approved</div>
          <div className="text-xs text-blue-600 mt-1">Admin approved</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold">{pendingTutorials.length}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-xs text-yellow-600 mt-1">Under review</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold">{draftTutorials.length}</div>
          <div className="text-sm text-muted-foreground">Drafts</div>
          <div className="text-xs text-gray-600 mt-1">In progress</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold">{rejectedTutorials.length}</div>
          <div className="text-sm text-muted-foreground">Rejected</div>
          <div className="text-xs text-red-600 mt-1">Needs revision</div>
        </Card>
      </div>

      {/* Tutorials List */}
      {filteredTutorials.length > 0 ? (
        <div className="space-y-6">
          {/* Published Tutorials */}
          {publishedTutorials.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Published Content ({publishedTutorials.length})
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                  Ready for Students
                </Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publishedTutorials.map((tutorial) => (
                  <TutorialCard 
                    key={tutorial.id}
                    tutorial={tutorial}
                    getStatusBadge={getStatusBadge}
                    getStatusMessage={getStatusMessage}
                    onEdit={handleEditTutorial}
                    onView={handleViewDetails}
                    onDownload={handleDownloadContent}
                    canEdit={canEditTutorial(tutorial)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Approved Tutorials */}
          {approvedTutorials.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                Approved Content ({approvedTutorials.length})
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                  Awaiting Publication
                </Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedTutorials.map((tutorial) => (
                  <TutorialCard 
                    key={tutorial.id}
                    tutorial={tutorial}
                    getStatusBadge={getStatusBadge}
                    getStatusMessage={getStatusMessage}
                    onEdit={handleEditTutorial}
                    onView={handleViewDetails}
                    onDownload={handleDownloadContent}
                    canEdit={canEditTutorial(tutorial)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pending Approval Tutorials */}
          {pendingTutorials.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Under Review ({pendingTutorials.length})
                <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700">
                  Awaiting Admin
                </Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingTutorials.map((tutorial) => (
                  <TutorialCard 
                    key={tutorial.id}
                    tutorial={tutorial}
                    getStatusBadge={getStatusBadge}
                    getStatusMessage={getStatusMessage}
                    onEdit={handleEditTutorial}
                    onView={handleViewDetails}
                    canEdit={canEditTutorial(tutorial)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Draft Tutorials */}
          {draftTutorials.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Drafts ({draftTutorials.length})
                <Badge variant="outline" className="ml-2 bg-gray-100 text-gray-700">
                  In Progress
                </Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {draftTutorials.map((tutorial) => (
                  <TutorialCard 
                    key={tutorial.id}
                    tutorial={tutorial}
                    getStatusBadge={getStatusBadge}
                    getStatusMessage={getStatusMessage}
                    onEdit={handleEditTutorial}
                    onSubmit={handleSubmitForApproval}
                    onDelete={handleDeleteTutorial}
                    onView={handleViewDetails}
                    canEdit={canEditTutorial(tutorial)}
                    canSubmit={canSubmitTutorial(tutorial)}
                    canDelete={canDeleteTutorial(tutorial)}
                    deletingId={deletingId}
                    submittingId={submittingId}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rejected Tutorials */}
          {rejectedTutorials.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Needs Revision ({rejectedTutorials.length})
                <Badge variant="outline" className="ml-2 bg-red-50 text-red-700">
                  Requires Updates
                </Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rejectedTutorials.map((tutorial) => (
                  <TutorialCard 
                    key={tutorial.id}
                    tutorial={tutorial}
                    getStatusBadge={getStatusBadge}
                    getStatusMessage={getStatusMessage}
                    onEdit={handleEditTutorial}
                    onSubmit={handleSubmitForApproval}
                    onDelete={handleDeleteTutorial}
                    onView={handleViewDetails}
                    canEdit={canEditTutorial(tutorial)}
                    canSubmit={canSubmitTutorial(tutorial)}
                    canDelete={canDeleteTutorial(tutorial)}
                    deletingId={deletingId}
                    submittingId={submittingId}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="text-center py-12 bg-card border-border">
          <CardContent>
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Content Packages Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first tutorial content package from the "My Courses" tab.
              <br />
              Once created, you can submit it for admin approval here.
            </p>
            {onTutorialUpdate && (
              <Button variant="outline" onClick={onTutorialUpdate} className="mt-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh List
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// UPDATED TutorialCard component with new approved status message
function TutorialCard({ 
  tutorial, 
  getStatusBadge, 
  getStatusMessage,
  onSubmit,
  onEdit, 
  onDelete, 
  onView,
  onDownload,
  canEdit,
  canSubmit,
  canDelete,
  deletingId,
  submittingId,
  formatDate
}: any) {
  return (
    <Card className="hover:shadow-md transition-shadow bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg text-foreground line-clamp-1">{tutorial.title}</CardTitle>
            <CardDescription className="line-clamp-2 text-sm">
              {tutorial.description}
            </CardDescription>
            {tutorial.course_title && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Course: {tutorial.course_title}
                </Badge>
              </div>
            )}
          </div>
          <div>
            {getStatusBadge(tutorial)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Content Info */}
          <div className="flex flex-wrap gap-2 text-sm">
            {tutorial.level && (
              <Badge variant="outline" className="text-xs">
                Level: {tutorial.level}
              </Badge>
            )}
            {tutorial.duration_hours && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {tutorial.duration_hours}h
              </Badge>
            )}
            {tutorial.batch_name && (
              <Badge variant="outline" className="text-xs">
                Batch: {tutorial.batch_name}
              </Badge>
            )}
          </div>

          {/* Status Message - UPDATED SECTION */}
          {tutorial.status === 'approved' ? (
            <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded border border-blue-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <div>
                  <p className="font-medium">Approved by admin</p>
                  <p className="text-xs mt-1">
                    Waiting for admin to publish. Once published, it will appear in the course for students.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-3 rounded text-sm ${
              tutorial.status === 'pending_approval' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
              tutorial.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
              tutorial.status === 'published' ? 'bg-green-50 text-green-700 border border-green-200' :
              'bg-gray-50 text-gray-700 border border-gray-200'
            }`}>
              <div className="flex items-start gap-2">
                {tutorial.status === 'pending_approval' && <Clock className="w-4 h-4 mt-0.5" />}
                {tutorial.status === 'rejected' && <XCircle className="w-4 h-4 mt-0.5" />}
                {tutorial.status === 'published' && <CheckCircle className="w-4 h-4 mt-0.5" />}
                <div>
                  <p className="font-medium">{getStatusMessage(tutorial)}</p>
                  {tutorial.status === 'rejected' && tutorial.rejection_reason && (
                    <p className="mt-1 text-xs">Feedback: {tutorial.rejection_reason}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {tutorial.status === 'draft' && canSubmit && (
              <Button 
                size="sm"
                onClick={() => onSubmit?.(tutorial.id)}
                disabled={submittingId === tutorial.id}
                className="flex-1"
              >
                {submittingId === tutorial.id ? (
                  <>
                    <Clock className="w-3 h-3 mr-1 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Submit for Approval
                  </>
                )}
              </Button>
            )}

            {tutorial.status === 'rejected' && canSubmit && (
              <Button 
                size="sm"
                onClick={() => onSubmit?.(tutorial.id)}
                disabled={submittingId === tutorial.id}
                className="flex-1"
              >
                {submittingId === tutorial.id ? (
                  <>
                    <Clock className="w-3 h-3 mr-1 animate-spin" />
                    Resubmitting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Resubmit for Approval
                  </>
                )}
              </Button>
            )}

            {tutorial.status === 'published' && onDownload && (
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onDownload?.(tutorial)}
                className="flex-1"
              >
                <Download className="w-3 h-3 mr-1" />
                Download Content
              </Button>
            )}

            {/* View Details */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onView?.(tutorial.id)}
            >
              <Eye className="w-3 h-3" />
            </Button>
            
            {/* Edit (for drafts/rejected) */}
            {canEdit && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEdit?.(tutorial.id)}
              >
                <Pencil className="w-3 h-3" />
              </Button>
            )}
            
            {/* Delete (for drafts/rejected) */}
            {canDelete && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDelete?.(tutorial.id)}
                disabled={deletingId === tutorial.id}
              >
                {deletingId === tutorial.id ? (
                  "Deleting..."
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
              </Button>
            )}

            {/* External link for published content */}
            {tutorial.status === 'published' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open(`/tutorials/${tutorial.id}`, '_blank')}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Footer info */}
          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <span>
              Created {formatDate(tutorial.created_at)}
            </span>
            {tutorial.approved_at && (
              <span className="text-blue-600">
                Approved {formatDate(tutorial.approved_at)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}