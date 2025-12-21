// components/Admin-Dashboard/TutorOnboardingTab.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Clock, User, GraduationCap, Briefcase, RefreshCw, Mail, Phone, MapPin, Eye, FileImage, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api";

interface TutorSubject {
  id: number;
  tutor_id: number;
  subject_name: string;
  specialization?: string;
  level: string;
}

interface TutorAvailability {
  id: number;
  tutor_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface TutorDetails {
  id: number;
  user_id: number;
  phone: string;
  age?: number;
  sex?: string;
  country?: string;
  city?: string;
  subcity?: string;
  address?: string;
  bio?: string;
  qualification: string;
  degree_photo?: string;
  degree_photo_url?: string;
  degree_verified?: 'pending' | 'approved' | 'rejected';
  experience_years: number;
  hourly_rate: number;
  is_verified: boolean;
  rejection_reason?: string;
  subjects: TutorSubject[];
  availability: TutorAvailability[];
}

interface PendingTutor {
  // User fields
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  email_verified_at: string;
  role: string;
  
  // Tutor object (nested)
  tutor?: TutorDetails;
}

interface TutorOnboardingTabProps {
  pendingTutors: PendingTutor[] | any;
  onApproveTutor: (tutorId: number) => void;
  onRejectTutor: (tutorId: number, rejectionReason: string) => void;
  onRefresh?: () => void;
  showDegreeVerification?: boolean;
}

export default function TutorOnboardingTab({
  pendingTutors,
  onApproveTutor,
  onRejectTutor,
  onRefresh,
  showDegreeVerification = true
}: TutorOnboardingTabProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<PendingTutor | null>(null);
  const [degreePhotoDialogOpen, setDegreePhotoDialogOpen] = useState(false);
  const [degreePhotoUrl, setDegreePhotoUrl] = useState<string | null>(null);
  const [loadingDegreePhoto, setLoadingDegreePhoto] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [degreeStats, setDegreeStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const tutors = Array.isArray(pendingTutors) ? pendingTutors : []; 

  // Calculate degree verification stats
  useEffect(() => {
    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    tutors.forEach(tutor => {
      if (tutor.tutor?.degree_verified === 'pending') stats.pending++;
      else if (tutor.tutor?.degree_verified === 'approved') stats.approved++;
      else if (tutor.tutor?.degree_verified === 'rejected') stats.rejected++;
    });

    setDegreeStats(stats);
  }, [tutors]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRejectClick = (tutorId: number) => {
    setSelectedTutorId(tutorId);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedTutorId && rejectionReason.trim()) {
      onRejectTutor(selectedTutorId, rejectionReason);
      setRejectDialogOpen(false);
      setSelectedTutorId(null);
      setRejectionReason("");
    }
  };

  const handleViewDetails = (tutor: PendingTutor) => {
    setSelectedTutor(tutor);
    setViewDetailsOpen(true);
  };

  const handleViewDegreePhoto = async (tutor: PendingTutor) => {
    if (!tutor.tutor?.degree_photo_url && !tutor.tutor?.degree_photo) {
      alert("No degree photo uploaded for this tutor");
      return;
    }

    try {
      setLoadingDegreePhoto(true);
      
      // Use the degree_photo_url directly from the API response
      const photoUrl = tutor.tutor?.degree_photo_url || 
        `http://localhost:8000/storage/${tutor.tutor?.degree_photo}`;
      
      setDegreePhotoUrl(photoUrl);
      setDegreePhotoDialogOpen(true);
      
    } catch (error) {
      console.error('Error loading degree photo:', error);
      alert("Failed to load degree photo. Please try again.");
    } finally {
      setLoadingDegreePhoto(false);
    }
  };

  const handleApproveDegree = async (tutorId: number) => {
    try {
      const response = await apiClient.post(`/admin/tutor-approvals/${tutorId}/approve-degree`);
      
      if (response.data.success) {
        alert("Degree approved successfully!");
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Error approving degree:', error);
      alert("Failed to approve degree. Please try again.");
    }
  };

  const handleRejectDegree = async (tutorId: number, reason: string) => {
    if (!reason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      const response = await apiClient.post(`/admin/tutor-approvals/${tutorId}/reject-degree`, {
        rejection_reason: reason
      });
      
      if (response.data.success) {
        alert("Degree rejected successfully!");
        setRejectDialogOpen(false);
        setRejectionReason("");
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Error rejecting degree:', error);
      alert("Failed to reject degree. Please try again.");
    }
  };

  const getDegreeStatusBadge = (status: string = 'pending') => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200">
            <Check className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200">
            <X className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const filteredTutors = activeTab === "pending" 
    ? tutors.filter(t => !t.tutor?.degree_verified || t.tutor?.degree_verified === 'pending')
    : tutors;

  if (tutors.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Tutor Onboarding</h2>
            <p className="text-muted-foreground">Review and approve tutor applications</p>
          </div>
          <Badge variant="outline" className="px-3 py-1 bg-card border-border">
            <Clock className="w-3 h-3 mr-1" />
            No pending applications
          </Badge>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              All Caught Up!
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              There are no pending tutor applications to review at this time.
              New applications will appear here for your approval.
            </p>
            {onRefresh && (
              <Button 
                variant="outline" 
                onClick={onRefresh}
                className="mt-4 bg-card hover:bg-accent border-border"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tutor Onboarding</h2>
          <p className="text-muted-foreground">Review and approve tutor applications</p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              className="bg-card hover:bg-accent border-border"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
          <Badge variant="destructive" className="px-3 py-1">
            {filteredTutors.length} {activeTab === "pending" ? "Pending" : "All"}
          </Badge>
        </div>
      </div>

      {/* Degree Verification Stats */}
      {showDegreeVerification && (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Degree Verification</h3>
                <p className="text-sm text-muted-foreground">Review tutor degree certificates</p>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pending">
                    Pending Verification
                    {degreeStats.pending > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                        {degreeStats.pending}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="all">
                    All Applications
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Pending</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{degreeStats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Approved</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{degreeStats.approved}</p>
                  </div>
                  <Check className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Rejected</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">{degreeStats.rejected}</p>
                  </div>
                  <X className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {filteredTutors.map((tutor) => (
          <Card 
            key={tutor.id} 
            className={`border-l-4 ${
              tutor.tutor?.degree_verified === 'approved' 
                ? 'border-l-green-500 dark:border-l-green-400' 
                : tutor.tutor?.degree_verified === 'rejected'
                ? 'border-l-red-500 dark:border-l-red-400'
                : 'border-l-orange-500 dark:border-l-orange-400'
            } bg-card border-border`}
          >
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-4">
                <div className="space-y-1 flex-1">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <User className="w-5 h-5 text-muted-foreground" />
                    {tutor.name}
                    {showDegreeVerification && (
                      <span className="ml-2">
                        {getDegreeStatusBadge(tutor.tutor?.degree_verified)}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row gap-2">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {tutor.email}
                    </span>
                    {tutor.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {tutor.phone}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground sm:text-right">
                  Applied {formatDate(tutor.created_at)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-sm font-medium text-foreground">Qualification:</span>
                  <span className="text-sm text-muted-foreground">{tutor.tutor?.qualification || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-green-500 dark:text-green-400" />
                  <span className="text-sm font-medium text-foreground">Experience:</span>
                  <span className="text-sm text-muted-foreground">{tutor.tutor?.experience_years || 0} years</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  <span className="text-sm font-medium text-foreground">Location:</span>
                  <span className="text-sm text-muted-foreground">
                    {tutor.tutor?.city && tutor.tutor?.country ? `${tutor.tutor.city}, ${tutor.tutor.country}` : 'Not specified'}
                  </span>
                </div>
              </div>

              {/* Degree Photo Section */}
              {showDegreeVerification && tutor.tutor?.degree_photo && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Degree Certificate</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDegreePhoto(tutor)}
                        disabled={loadingDegreePhoto}
                        className="bg-card hover:bg-accent border-border"
                      >
                        <Eye className="w-3 h-3 mr-2" />
                        {loadingDegreePhoto ? "Loading..." : "View Certificate"}
                      </Button>
                      {tutor.tutor?.degree_verified === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveDegree(tutor.id)}
                            className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Check className="w-3 h-3 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTutorId(tutor.id);
                              setRejectDialogOpen(true);
                            }}
                            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="w-3 h-3 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileImage className="w-4 h-4" />
                    <span>Degree photo uploaded</span>
                  </div>
                </div>
              )}

              {!tutor.tutor?.degree_photo && showDegreeVerification && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    No degree certificate uploaded
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-foreground">Subjects:</span>
                {tutor.tutor?.subjects && Array.isArray(tutor.tutor.subjects) && tutor.tutor.subjects.length > 0 ? (
                  tutor.tutor.subjects.map((subject) => (
                    <Badge 
                      key={subject.id} 
                      variant="secondary" 
                      className="text-xs bg-secondary text-secondary-foreground border-border"
                    >
                      {subject.subject_name} ({subject.level})
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No subjects specified</span>
                )}
              </div>

              {tutor.tutor?.bio && (
                <div className="text-sm">
                  <span className="font-medium text-foreground">Bio: </span>
                  <span className="text-muted-foreground line-clamp-2">{tutor.tutor.bio}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-between pt-4 border-t border-border">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(tutor)}
                    className="bg-card hover:bg-accent border-border"
                  >
                    View Details
                  </Button>
                  {!showDegreeVerification && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectClick(tutor.id)}
                      className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  {showDegreeVerification && tutor.tutor?.degree_verified !== 'approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApproveDegree(tutor.id)}
                      className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve Degree
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => onApproveTutor(tutor.id)}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve & Activate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredTutors.length} {activeTab === "pending" ? "pending" : ""} tutor application{filteredTutors.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-muted-foreground">Pending Review</span>
              </div>
              <div className="text-xs text-muted-foreground">
                ⚠️ Tutors will receive email notification when approved/rejected
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Degree Photo Viewer Dialog */}
      <Dialog open={degreePhotoDialogOpen} onOpenChange={setDegreePhotoDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Degree Certificate</DialogTitle>
            <DialogDescription>
              Viewing degree certificate for {selectedTutor?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center items-center min-h-[400px] bg-muted rounded-lg">
            {degreePhotoUrl ? (
              <img 
                src={degreePhotoUrl} 
                alt="Degree Certificate" 
                className="max-w-full max-h-[60vh] object-contain"
                onError={(e) => {
                  console.error('Error loading image');
                  e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Certificate+Not+Found';
                }}
              />
            ) : (
              <div className="text-center">
                <FileImage className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading certificate...</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (degreePhotoUrl) {
                  URL.revokeObjectURL(degreePhotoUrl);
                  setDegreePhotoUrl(null);
                }
                setDegreePhotoDialogOpen(false);
              }}
            >
              Close
            </Button>
            {selectedTutor && (
              <div className="flex gap-2">
                {selectedTutor.tutor?.degree_verified !== 'approved' && (
                  <Button
                    onClick={() => {
                      handleApproveDegree(selectedTutor.id);
                      setDegreePhotoDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve Degree
                  </Button>
                )}
                <Button
                  onClick={() => onApproveTutor(selectedTutor.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve Full Application
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog (for both application and degree) */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {showDegreeVerification && selectedTutor?.tutor?.degree_photo 
                ? "Reject Degree Certificate" 
                : "Reject Tutor Application"}
            </DialogTitle>
            <DialogDescription>
              {showDegreeVerification && selectedTutor?.tutor?.degree_photo
                ? "Please provide a reason for rejecting this degree certificate. This reason will be sent to the tutor via email."
                : "Please provide a reason for rejecting this tutor application. This reason will be sent to the tutor via email."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                placeholder={
                  showDegreeVerification && selectedTutor?.tutor?.degree_photo
                    ? "Explain why the degree certificate is being rejected..."
                    : "Explain why the tutor application is being rejected..."
                }
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[120px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters. This will be included in the rejection email.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (showDegreeVerification && selectedTutor?.tutor?.degree_photo) {
                  handleRejectDegree(selectedTutorId!, rejectionReason);
                } else {
                  handleConfirmReject();
                }
              }}
              disabled={!rejectionReason.trim() || rejectionReason.trim().length < 10}
            >
              <X className="w-4 h-4 mr-2" />
              {showDegreeVerification && selectedTutor?.tutor?.degree_photo
                ? "Reject Degree"
                : "Reject Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tutor Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedTutor && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Tutor Application Details
                </DialogTitle>
                <DialogDescription>
                  Full application details for {selectedTutor.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p className="text-foreground">{selectedTutor.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-foreground">{selectedTutor.email}</p>
                    </div>
                    {selectedTutor.phone && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p className="text-foreground">{selectedTutor.phone}</p>
                      </div>
                    )}
                    {selectedTutor.tutor?.age && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Age</p>
                        <p className="text-foreground">{selectedTutor.tutor.age} years</p>
                      </div>
                    )}
                    {selectedTutor.tutor?.country && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Country</p>
                        <p className="text-foreground">{selectedTutor.tutor.country}</p>
                      </div>
                    )}
                    {selectedTutor.tutor?.city && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">City</p>
                        <p className="text-foreground">{selectedTutor.tutor.city}</p>
                      </div>
                    )}
                    {selectedTutor.tutor?.address && (
                      <div className="md:col-span-2 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                        <p className="text-foreground">{selectedTutor.tutor.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Professional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Qualification</p>
                      <p className="text-foreground">{selectedTutor.tutor?.qualification || 'Not specified'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Experience</p>
                      <p className="text-foreground">{selectedTutor.tutor?.experience_years || 0} years</p>
                    </div>
                    {selectedTutor.tutor?.hourly_rate && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Hourly Rate</p>
                        <p className="text-foreground">${selectedTutor.tutor.hourly_rate}/hour</p>
                      </div>
                    )}
                    {showDegreeVerification && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Degree Status</p>
                        <div className="mt-1">
                          {getDegreeStatusBadge(selectedTutor.tutor?.degree_verified)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Degree Certificate Section */}
                {showDegreeVerification && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Degree Certificate</h4>
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      {selectedTutor.tutor?.degree_photo ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileImage className="w-5 h-5 text-blue-500" />
                              <span className="text-sm font-medium text-foreground">Certificate Uploaded</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                handleViewDegreePhoto(selectedTutor);
                                setViewDetailsOpen(false);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Certificate
                            </Button>
                          </div>
                          {selectedTutor.tutor?.rejection_reason && (
                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Rejection Reason:</p>
                              <p className="text-sm text-red-600 dark:text-red-400">{selectedTutor.tutor.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <p className="text-sm text-muted-foreground">No degree certificate uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Subjects */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Subjects</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTutor.tutor?.subjects && selectedTutor.tutor.subjects.length > 0 ? (
                      selectedTutor.tutor.subjects.map((subject) => (
                        <Badge 
                          key={subject.id} 
                          variant="secondary" 
                          className="text-sm bg-secondary text-secondary-foreground border-border"
                        >
                          {subject.subject_name} ({subject.level})
                          {subject.specialization && ` - ${subject.specialization}`}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No subjects specified</span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {selectedTutor.tutor?.bio && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Bio/Introduction</h4>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border">
                      <p className="text-foreground whitespace-pre-line">{selectedTutor.tutor.bio}</p>
                    </div>
                  </div>
                )}

                {/* Application Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Application Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Application Date</p>
                      <p className="text-foreground">{formatDate(selectedTutor.created_at)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200">
                        Pending Approval
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setViewDetailsOpen(false)}
                >
                  Close
                </Button>
                <div className="flex gap-2">
                  {showDegreeVerification && selectedTutor.tutor?.degree_photo && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleViewDegreePhoto(selectedTutor);
                        setViewDetailsOpen(false);
                      }}
                      className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Certificate
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleRejectClick(selectedTutor.id);
                      setViewDetailsOpen(false);
                    }}
                    className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      onApproveTutor(selectedTutor.id);
                      setViewDetailsOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve Tutor
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}