// components/Admin-Dashboard/PendingTutorialsTab.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  BookOpen,
  Eye
} from "lucide-react";

interface PendingTutorial {
  id: number;
  title: string;
  description: string;
  tutor_id: number;
  tutor_name: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'published';
  created_at: string;
  category?: {
    name: string;
  };
  price: number;
  level: string;
}

export default function PendingTutorialsTab({ 
  searchQuery,
  onRefresh 
}: { 
  searchQuery: string;
  onRefresh: () => void;
}) {
  const [tutorials, setTutorials] = useState<PendingTutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedTutorial, setSelectedTutorial] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchPendingTutorials = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/tutorials/pending-approval");
      if (response.data.success) {
        setTutorials(response.data.tutorials || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch pending tutorials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTutorial = async (tutorialId: number) => {
    try {
      await apiClient.post(`/admin/tutorials/${tutorialId}/approve`);
      toast({
        title: "Success",
        description: "Tutorial approved successfully",
      });
      fetchPendingTutorials();
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve tutorial",
        variant: "destructive",
      });
    }
  };

  const handleRejectTutorial = async (tutorialId: number) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiClient.post(`/admin/tutorials/${tutorialId}/reject`, {
        reason: rejectionReason
      });
      toast({
        title: "Success",
        description: "Tutorial rejected",
      });
      setRejectionReason("");
      setSelectedTutorial(null);
      fetchPendingTutorials();
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject tutorial",
        variant: "destructive",
      });
    }
  };

  const handlePublishTutorial = async (tutorialId: number) => {
    try {
      await apiClient.post(`/admin/tutorials/${tutorialId}/publish`);
      toast({
        title: "Success",
        description: "Tutorial published successfully",
      });
      fetchPendingTutorials();
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to publish tutorial",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPendingTutorials();
  }, []);

  const filteredTutorials = tutorials.filter(tutorial =>
    tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutorial.tutor_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading pending tutorials...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pending Tutorial Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve tutorials created by tutors
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchPendingTutorials} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tutorials.filter(t => t.status === 'pending_approval').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Created by tutors, waiting for admin review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ready to Publish
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tutorials.filter(t => t.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Approved tutorials ready for publishing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tutorials List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Tutorials</CardTitle>
          <CardDescription>
            Review tutorial content and approve or reject
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTutorials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending tutorials found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTutorials.map((tutorial) => (
                <div
                  key={tutorial.id}
                  className="flex flex-col p-4 border rounded-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{tutorial.title}</span>
                        <Badge
                          variant={
                            tutorial.status === 'pending_approval' ? 'secondary' :
                            tutorial.status === 'approved' ? 'default' :
                            tutorial.status === 'rejected' ? 'destructive' : 'outline'
                          }
                        >
                          {tutorial.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>Created by: {tutorial.tutor_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(tutorial.created_at).toLocaleDateString()}</span>
                        </div>
                        {tutorial.category && (
                          <Badge variant="outline">
                            {tutorial.category.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tutorial.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {tutorial.status === 'pending_approval' && (
                        <>
                          <Button
                            onClick={() => handleApproveTutorial(tutorial.id)}
                            size="sm"
                            className="gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => setSelectedTutorial(tutorial.id)}
                            variant="destructive"
                            size="sm"
                            className="gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </Button>
                        </>
                      )}
                      {tutorial.status === 'approved' && (
                        <Button
                          onClick={() => handlePublishTutorial(tutorial.id)}
                          size="sm"
                          className="gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Publish
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Rejection Form */}
                  {selectedTutorial === tutorial.id && (
                    <div className="mt-4 p-4 border rounded bg-muted/50">
                      <h4 className="font-medium mb-2">Rejection Reason</h4>
                      <Textarea
                        placeholder="Provide detailed reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="mb-2"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTutorial(null);
                            setRejectionReason("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectTutorial(tutorial.id)}
                        >
                          Confirm Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}