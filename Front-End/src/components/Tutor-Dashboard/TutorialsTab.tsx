import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Users, 
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
  Eye
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
  status: string; // Add this - 'draft', 'pending_approval', 'approved', 'published', 'rejected'
  is_published?: boolean; // Keep for backward compatibility
  created_by_role?: 'tutor' | 'admin';
  admin_id?: number;
  approved_by_admin_id?: number;
  approved_at?: string;
  rejection_reason?: string;
}

interface TutorialsTabProps {
  tutorials: Tutorial[];
  onCreateTutorial: () => void;
  onTutorialUpdate?: () => void;
}

export default function TutorialsTab({ tutorials, onCreateTutorial, onTutorialUpdate }: TutorialsTabProps) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const getStatusBadge = (tutorial: Tutorial) => {
    const status = tutorial.status || (tutorial.is_published ? 'published' : 'draft');
    
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
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <AlertCircle className="w-3 h-3 mr-1" />
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

  const handlePublishTutorial = async (tutorialId: number) => {
    try {
      const response = await apiClient.patch(`/tutor/tutorials/${tutorialId}/publish`);
      
      if (response.data.success) {
        toast({
          title: "Success!",
          description: "Tutorial published successfully",
        });
        onTutorialUpdate?.();
      } else {
        throw new Error(response.data.message || "Failed to publish tutorial");
      }
    } catch (error: any) {
      console.error("Publish tutorial error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to publish tutorial",
        variant: "destructive",
      });
    }
  };

  const handleUnpublishTutorial = async (tutorialId: number) => {
    try {
      const response = await apiClient.patch(`/tutor/tutorials/${tutorialId}/unpublish`);
      
      if (response.data.success) {
        toast({
          title: "Success!",
          description: "Tutorial unpublished successfully",
        });
        onTutorialUpdate?.();
      } else {
        throw new Error(response.data.message || "Failed to unpublish tutorial");
      }
    } catch (error: any) {
      console.error("Unpublish tutorial error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to unpublish tutorial",
        variant: "destructive",
      });
    }
  };

  const handleEditTutorial = (tutorialId: number) => {
    // Navigate to edit page or open edit dialog
    toast({
      title: "Edit Tutorial",
      description: `Editing tutorial #${tutorialId}`,
    });
  };

  const handleDeleteTutorial = async (tutorialId: number) => {
    if (!confirm("Are you sure you want to delete this tutorial? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(tutorialId);
      const response = await apiClient.delete(`/tutor/tutorials/${tutorialId}`);
      
      if (response.data.success) {
        toast({
          title: "Deleted!",
          description: "Tutorial deleted successfully",
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
    // Navigate to tutorial details page
    toast({
      title: "View Details",
      description: `Viewing tutorial #${tutorialId} details`,
    });
  };

  const canEditTutorial = (tutorial: Tutorial) => {
    // Tutors can edit drafts, rejected, or their own tutorials
    // Cannot edit if status is 'published' or 'pending_approval'
    const status = tutorial.status || (tutorial.is_published ? 'published' : 'draft');
    return ['draft', 'rejected', 'approved'].includes(status);
  };

  const canPublishTutorial = (tutorial: Tutorial) => {
    // Only approved tutorials can be published by tutors
    const status = tutorial.status || (tutorial.is_published ? 'published' : 'draft');
    return status === 'approved' || status === 'draft';
  };

  const canDeleteTutorial = (tutorial: Tutorial) => {
    // Only drafts or rejected tutorials can be deleted
    const status = tutorial.status || (tutorial.is_published ? 'published' : 'draft');
    return ['draft', 'rejected'].includes(status);
  };

  // Filter tutorials for display
  const filteredTutorials = tutorials.filter(tutorial => {
    const status = tutorial.status || (tutorial.is_published ? 'published' : 'draft');
    // Show all except archived
    return status !== 'archived';
  });

  // Group tutorials by status
  const publishedTutorials = filteredTutorials.filter(t => 
    (t.status || (t.is_published ? 'published' : 'draft')) === 'published'
  );
  const pendingTutorials = filteredTutorials.filter(t => 
    (t.status || (t.is_published ? 'published' : 'draft')) === 'pending_approval'
  );
  const draftTutorials = filteredTutorials.filter(t => 
    (t.status || (t.is_published ? 'published' : 'draft')) === 'draft'
  );
  const rejectedTutorials = filteredTutorials.filter(t => 
    (t.status || (t.is_published ? 'published' : 'draft')) === 'rejected'
  );
  const approvedTutorials = filteredTutorials.filter(t => 
    (t.status || (t.is_published ? 'published' : 'draft')) === 'approved'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">My Tutorials</h2>
          <p className="text-muted-foreground">
            Manage your tutorials. New tutorials require admin approval.
          </p>
        </div>
        <Button onClick={onCreateTutorial}>
          <Plus className="w-4 h-4 mr-2" />
          Create Tutorial
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold">{publishedTutorials.length}</div>
          <div className="text-sm text-muted-foreground">Published</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold">{pendingTutorials.length}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold">{approvedTutorials.length}</div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold">{draftTutorials.length}</div>
          <div className="text-sm text-muted-foreground">Drafts</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold">{rejectedTutorials.length}</div>
          <div className="text-sm text-muted-foreground">Rejected</div>
        </Card>
      </div>

      {/* Tutorials List */}
      {filteredTutorials.length > 0 ? (
        <div className="space-y-4">
          {/* Published Tutorials */}
          {publishedTutorials.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Published Tutorials ({publishedTutorials.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publishedTutorials.map((tutorial) => (
                  <TutorialCard 
                    key={tutorial.id}
                    tutorial={tutorial}
                    getStatusBadge={getStatusBadge}
                    onUnpublish={handleUnpublishTutorial}
                    onEdit={handleEditTutorial}
                    onDelete={handleDeleteTutorial}
                    onView={handleViewDetails}
                    canEdit={canEditTutorial(tutorial)}
                    canDelete={canDeleteTutorial(tutorial)}
                    deletingId={deletingId}
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
                Waiting for Approval ({pendingTutorials.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingTutorials.map((tutorial) => (
                  <TutorialCard 
                    key={tutorial.id}
                    tutorial={tutorial}
                    getStatusBadge={getStatusBadge}
                    onEdit={handleEditTutorial}
                    onDelete={handleDeleteTutorial}
                    onView={handleViewDetails}
                    canEdit={canEditTutorial(tutorial)}
                    canDelete={canDeleteTutorial(tutorial)}
                    deletingId={deletingId}
                    showMessage="Waiting for admin approval"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Approved Tutorials (can be published) */}
          {approvedTutorials.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                Approved - Ready to Publish ({approvedTutorials.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedTutorials.map((tutorial) => (
                  <TutorialCard 
                    key={tutorial.id}
                    tutorial={tutorial}
                    getStatusBadge={getStatusBadge}
                    onPublish={handlePublishTutorial}
                    onEdit={handleEditTutorial}
                    onDelete={handleDeleteTutorial}
                    onView={handleViewDetails}
                    canEdit={canEditTutorial(tutorial)}
                    canDelete={canDeleteTutorial(tutorial)}
                    deletingId={deletingId}
                    showMessage="Approved by admin - ready to publish"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Draft Tutorials */}
          {draftTutorials.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-500" />
                Drafts ({draftTutorials.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {draftTutorials.map((tutorial) => (
                  <TutorialCard 
                    key={tutorial.id}
                    tutorial={tutorial}
                    getStatusBadge={getStatusBadge}
                    onEdit={handleEditTutorial}
                    onDelete={handleDeleteTutorial}
                    onView={handleViewDetails}
                    canEdit={canEditTutorial(tutorial)}
                    canDelete={canDeleteTutorial(tutorial)}
                    deletingId={deletingId}
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
                Rejected Tutorials ({rejectedTutorials.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rejectedTutorials.map((tutorial) => (
                  <TutorialCard 
                    key={tutorial.id}
                    tutorial={tutorial}
                    getStatusBadge={getStatusBadge}
                    onEdit={handleEditTutorial}
                    onDelete={handleDeleteTutorial}
                    onView={handleViewDetails}
                    canEdit={canEditTutorial(tutorial)}
                    canDelete={canDeleteTutorial(tutorial)}
                    deletingId={deletingId}
                    showMessage={tutorial.rejection_reason ? `Rejected: ${tutorial.rejection_reason}` : "Rejected by admin"}
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
            <h3 className="text-lg font-medium text-foreground mb-2">No tutorials yet</h3>
            <p className="text-muted-foreground mb-4">Create your first tutorial to start teaching</p>
            <Button onClick={onCreateTutorial}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Tutorial
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Separate TutorialCard component for better organization
function TutorialCard({ 
  tutorial, 
  getStatusBadge, 
  onPublish, 
  onUnpublish, 
  onEdit, 
  onDelete, 
  onView,
  canEdit,
  canDelete,
  deletingId,
  showMessage
}: any) {
  const status = tutorial.status || (tutorial.is_published ? 'published' : 'draft');

  return (
    <Card className="hover:shadow-lg transition-shadow bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-foreground">{tutorial.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {tutorial.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              {tutorial.category}
            </Badge>
            {getStatusBadge(tutorial)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{tutorial.student_count} students</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{tutorial.completed_sessions}/{tutorial.total_sessions} sessions</span>
            </div>
          </div>
          
          {showMessage && (
            <div className={`p-2 rounded text-sm ${
              status === 'pending_approval' ? 'bg-yellow-50 text-yellow-700' :
              status === 'rejected' ? 'bg-red-50 text-red-700' :
              status === 'approved' ? 'bg-blue-50 text-blue-700' :
              'bg-gray-50 text-gray-700'
            }`}>
              {showMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {status === 'published' ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onUnpublish?.(tutorial.id)}
                className="flex-1"
              >
                <EyeOff className="w-3 h-3 mr-1" />
                Unpublish
              </Button>
            ) : status === 'approved' ? (
              <Button 
                size="sm"
                onClick={() => onPublish?.(tutorial.id)}
                className="flex-1"
              >
                <Globe className="w-3 h-3 mr-1" />
                Publish Now
              </Button>
            ) : status === 'draft' ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit?.(tutorial.id)}
                className="flex-1"
              >
                <Pencil className="w-3 h-3 mr-1" />
                Edit
              </Button>
            ) : null}
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onView?.(tutorial.id)}
            >
              <Eye className="w-3 h-3" />
            </Button>
            
            {canEdit && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEdit?.(tutorial.id)}
              >
                <Pencil className="w-3 h-3" />
              </Button>
            )}
            
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
          </div>

          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <span>
              Created {new Date(tutorial.created_at).toLocaleDateString()}
            </span>
            {tutorial.created_by_role === 'admin' && (
              <span className="text-blue-600">Assigned by Admin</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}