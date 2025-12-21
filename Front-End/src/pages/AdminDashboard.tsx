// AdminDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UniversalSidebar } from "@/components/UniversalSidebar";
import { UserManagementDialog } from "@/components/Admin-Dashboard/UserManagementDialog";
import { ManageClassDialog } from "@/components/Admin-Dashboard/ManageClassDialog";
import { SendMessageDialog } from "@/components/Admin-Dashboard/SendMessageDialog";
import EmailQueueTab from "@/components/Admin-Dashboard/EmailQueueTab";
import { Button } from "@/components/ui/button";
import { Mail, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Download, 
  Search, 
  Filter, 
  Shield, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3,
  UserCheck,
  Clock,
  ClipboardCheck,
  ClipboardList,
  Bell,
  FileText,
  MessageCircle
} from "lucide-react";
import { apiClient } from "@/lib/api";

// Import components
import UsersTab from "@/components/Admin-Dashboard/UsersTab";
import ClassesTab from "@/components/Admin-Dashboard/ClassesTab";
import AnalyticsTab from "@/components/Admin-Dashboard/AnalyticsTab";
import AdminOverview from "@/components/Admin-Dashboard/AdminOverview";
import TutorOnboardingTab from "@/components/Admin-Dashboard/TutorOnboardingTab";
import PendingTutorialsTab from "@/components/Admin-Dashboard/PendingTutorialsTab";
import ReportingTab from "@/components/Admin-Dashboard/ReportingTab";
import CommunicationTab from "@/components/Admin-Dashboard/CommunicationTab";
import AttendanceTrackingTab from "@/components/Admin-Dashboard/AttendanceTrackingTab";
import CreateClassDialog from "@/components/Admin-Dashboard/CreateClassDialog";
import AssignmentsTab from "@/components/Admin-Dashboard/AssignmentsTab";

// Types matching your backend responses
interface Admin {
  name: string;
  email: string;
  role: string;
}

interface SystemStats {
  total_users: number;
  total_students: number;
  total_tutors: number;
  pending_verifications: number;
  pending_reports: number;
  total_classes: number;
  recent_attendance_count: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
  lastActive: string;
  joinDate: string;
  classes: number;
}

interface PendingTutor {
  id: number;
  user_id: number;
  name: string;
  email: string;
  qualification: string;
  experience_years: number;
  subjects: string[];
  submitted_at: string;
}

interface PendingReport {
  id: number;
  session_id: number;
  tutor_name: string;
  session_title: string;
  session_date: string;
  students_present: number;
  total_students: number;
  submitted_at: string;
}

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  time: string;
  type: string;
}

interface DashboardData {
  admin: Admin;
  stats: SystemStats;
  recent_activities: RecentActivity[];
  users: User[];
  pending_tutors: PendingTutor[];
  pending_reports: PendingReport[];
  classes?: any[];
}

// Admin-specific navigation items
const adminNavigationItems = [
  { title: "Overview", value: "overview", icon: LayoutDashboard },
  { title: "User Management", value: "users", icon: Users },
  { title: "Tutor Onboarding", value: "tutor-onboarding", icon: UserCheck },
  { title: "Class Management", value: "classes", icon: BookOpen },
  { title: "Pending Approvals", value: "pending-approvals", icon: Clock },
  { title: "Assignments", value: "assignments", icon: ClipboardList },
  { title: "Reporting", value: "reporting", icon: ClipboardCheck },
  { title: "Communication", value: "communication", icon: Bell },
  { title: "Attendance Tracking", value: "attendance", icon: FileText },
  { title: "Analytics", value: "analytics", icon: BarChart3 },
  ...(process.env.NODE_ENV === 'development' ? [
    { title: "Email Queue", value: "email-queue", icon: Mail }
  ] : []),
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCommunication, setShowCommunication] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSendMessageDialog, setShowSendMessageDialog] = useState(false);
  const [selectedUserForMessage, setSelectedUserForMessage] = useState<User | null>(null);
  const [pendingTutors, setPendingTutors] = useState<PendingTutor[]>([]);
  const [showCreateClass, setShowCreateClass] = useState(false);

  // In your AdminDashboard.tsx, update the data fetching functions:

const fetchDashboardData = async () => {
  try {
    setLoading(true);
    const response = await apiClient.get("/admin/dashboard");
    const data = response.data;

    if (data.success) {
      // Map users data to match UsersTab expectations
      const mappedUsers = (data.users || []).map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'active',
        avatar: user.avatar || user.profile_photo || '',
        lastActive: user.last_login_at || user.last_active || new Date().toISOString().split('T')[0],
        joinDate: new Date(user.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        classes: user.enrollments_count || user.tutorials_count || 0
      }));

      const pendingResponse = await apiClient.get("/tutor-approvals/pending");
      const pendingTutors = pendingResponse.data.success 
        ? pendingResponse.data.tutors?.data || []
        : [];

      setDashboardData({
        admin: {
          name: user?.name || "Administrator",
          email: user?.email || "",
          role: user?.role || "admin"
        },
        stats: data.stats || {
          total_users: 0,
          total_students: 0,
          total_tutors: 0,
          pending_verifications: 0,
          pending_reports: 0,
          total_classes: 0,
          recent_attendance_count: 0
        },
        recent_activities: data.recent_activities || [],
        users: mappedUsers,
        pending_tutors: pendingTutors,
        pending_reports: data.pending_reports || [],
        classes: data.classes || [] // Add classes data if available
      });
    } else {
      throw new Error(data.message || "Failed to load dashboard");
    }
  } catch (error: any) {
    console.error("Admin dashboard error:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to load admin dashboard.",
      variant: "destructive",
    });

    if (error.response?.status === 401) {
      logout();
      navigate("/login?redirect=/admin");
    }
  } finally {
    setLoading(false);
  }
};

// Update fetchTabData to handle all tabs
const fetchTabData = async (tab: string) => {
  try {
    switch (tab) {
      case "users": {
        const usersResponse = await apiClient.get("/admin/users");
        if (usersResponse.data.success && dashboardData) {
          const mappedUsers = (usersResponse.data.users || []).map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status || 'active',
            avatar: user.avatar || user.profile_photo || '',
            lastActive: user.last_login_at || user.last_active || new Date().toISOString().split('T')[0],
            joinDate: new Date(user.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            classes: user.enrollments_count || user.tutorials_count || 0
          }));
          
          setDashboardData(prev => prev ? {
            ...prev,
            users: mappedUsers
          } : null);
        }
        break;
      }
      
      case "tutor-onboarding": {
        const tutorsResponse = await apiClient.get("/tutor-approvals/pending");
        if (tutorsResponse.data.success && dashboardData) {
          const tutorsData = tutorsResponse.data.tutors?.data || [];
          setDashboardData(prev => prev ? {
            ...prev,
            pending_tutors: tutorsData
          } : null);
        }
        break;
      }
      
      case "reporting": {
        const reportsResponse = await apiClient.get("/admin/pending-reports");
        if (reportsResponse.data.success && dashboardData) {
          setDashboardData(prev => prev ? {
            ...prev,
            pending_reports: reportsResponse.data.reports || []
          } : null);
        }
        break;
      }

      // In AdminDashboard.tsx, update the fetchTabData function for classes:

case "classes": {
  const classesResponse = await apiClient.get("/admin/classes");
  if (classesResponse.data.success && dashboardData) {
    const mappedClasses = (classesResponse.data.classes || []).map((classItem: any) => ({
      id: classItem.id,
      title: classItem.title,
      name: classItem.title, // For compatibility
      description: classItem.description || '',
      tutor: classItem.tutor || 'Unknown Tutor',
      tutor_details: classItem.tutor_details,
      students: classItem.students || 0,
      max_capacity: classItem.max_capacity || 30,
      rating: classItem.rating || 0,
      subject: classItem.subject || 'General',
      category: classItem.category,
      color: classItem.color || `bg-blue-500`,
      enrollmentCode: classItem.enrollmentCode || `CLASS-${classItem.id}`,
      assignments: classItem.assignments || 0,
      active: classItem.active !== false,
      completionRate: classItem.completionRate || 0,
      duration: classItem.duration || '0 hours',
      level: classItem.level || 'Beginner',
      price: classItem.price || 0,
      created_at: classItem.created_at,
      updated_at: classItem.updated_at
    }));
    
    setDashboardData(prev => prev ? {
      ...prev,
      classes: mappedClasses
    } : null);
  }
  break;
}

      case "attendance": {
        const attendanceResponse = await apiClient.get("/admin/attendance/stats");
        // You can handle attendance data here if needed
        break;
      }
    }
  } catch (error: any) {
    console.error(`Error fetching ${tab} data:`, error);
    toast({
      title: "Error",
      description: `Failed to load ${tab} data.`,
      variant: "destructive",
    });
  }
};

const openSendMessageDialog = (user?: User) => {
    setSelectedUserForMessage(user || null);
    setShowSendMessageDialog(true);
  };
  
  // Function to close dialog
  const closeSendMessageDialog = () => {
    setShowSendMessageDialog(false);
    setSelectedUserForMessage(null);
  };

const handleFilterClick = () => {
    setShowFilters(!showFilters);
    toast({
      title: "Filters",
      description: showFilters ? "Filters hidden" : "Filters expanded",
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (dashboardData && activeTab !== "overview") {
      fetchTabData(activeTab);
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleApproveTutor = async (tutorId: number) => {
  try {
    // Use correct endpoint
    const response = await apiClient.post(`/tutor-approvals/${tutorId}/approve`);
    
    if (response.data.success) {
      toast({
        title: "Tutor Approved",
        description: response.data.message || "Tutor approved successfully!",
      });
      // Refresh data
      fetchTabData("tutor-onboarding");
    }
  } catch (error: any) {
    toast({
      title: "Approval Failed",
      description: error.response?.data?.message || "Failed to approve tutor",
      variant: "destructive"
    });
  }
};

  const fetchPendingTutors = async () => {
  try {
    // Use the correct endpoint for pending approval tutors
    const response = await apiClient.get('/tutor-approvals/pending');
    
    if (response.data.success) {
      // The backend should return tutors with degree_photo_url
      setPendingTutors(response.data.tutors || []);
    }
  } catch (error) {
    console.error('Error fetching pending tutors:', error);
    toast({
      title: "Error",
      description: "Failed to load pending tutors",
      variant: "destructive",
    });
  }
};

  const handleRejectTutor = async (tutorId: number, rejectionReason: string) => {
  try {
    // Use correct endpoint
    const response = await apiClient.post(`/admin/tutor-approvals/${tutorId}/reject`, {
      rejection_reason: rejectionReason
    });
    
    if (response.data.success) {
      toast({
        title: "Tutor Rejected",
        description: response.data.message || "Tutor application rejected.",
      });
      // Refresh data
      fetchTabData("tutor-onboarding");
    }
  } catch (error: any) {
    toast({
      title: "Rejection Failed",
      description: error.response?.data?.message || "Failed to reject tutor",
      variant: "destructive"
    });
  }
};

  const handleApproveReport = async (reportId: number) => {
    try {
      await apiClient.post(`/admin/reports/${reportId}/approve`);
      toast({
        title: "Report Approved",
        description: "Session report has been approved.",
      });
      // Refresh data
      fetchTabData("reporting");
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error.response?.data?.message || "Failed to approve report",
        variant: "destructive"
      });
    }
  };

  const handleSendNotification = async (data: {
    target: 'all' | 'students' | 'tutors';
    title: string;
    message: string;
  }) => {
    try {
      await apiClient.post("/admin/notifications", data);
      toast({
        title: "Notification Sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Send Failed",
        description: error.response?.data?.message || "Failed to send notification",
        variant: "destructive"
      });
    }
  };

  const handleExportReports = async () => {
    try {
      toast({
        title: "Export Started",
        description: "Your reports are being prepared for download.",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.response?.data?.message || "Failed to generate reports.",
        variant: "destructive"
      });
    }
  };

  const handleViewProfile = () => {
    // Navigate to admin profile page when created
    toast({
      title: "Profile",
      description: "Admin profile page coming soon.",
    });
  };

  // Check if current tab should show search (not overview)
  const shouldShowSearch = activeTab !== "overview";

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-background flex w-full overflow-x-hidden">
          <UniversalSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            navigationItems={adminNavigationItems}
            userRole="admin"
            userName={user?.name}
          />
          <div className="flex-1 flex items-center justify-center w-full overflow-x-hidden">
            <div className="text-center text-lg text-foreground">Loading admin dashboard...</div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!dashboardData) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-background flex w-full overflow-x-hidden">
          <UniversalSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            navigationItems={adminNavigationItems}
            userRole="admin"
            userName={user?.name}
          />
          <div className="flex-1 flex items-center justify-center w-full overflow-x-hidden">
            <div className="text-center bg-card rounded-lg border border-border p-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Unable to load admin dashboard
              </h2>
              <Button onClick={fetchDashboardData}>Retry</Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const { admin, stats, recent_activities, users, pending_tutors, pending_reports } = dashboardData;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground flex w-full overflow-x-hidden">
        {/* Sidebar */}
        <UniversalSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          onOpenMessages={() => setShowCommunication(true)}
          navigationItems={adminNavigationItems}
          userRole="admin"
          userName={admin.name}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
          {/* Header */}
          <div className="bg-card border-b border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full max-w-full">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <SidebarTrigger />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {activeTab === "overview" ? "Admin Dashboard" : 
                   activeTab === "tutor-onboarding" ? "Tutor Onboarding" :
                   activeTab === "communication" ? "Communication Center" :
                   activeTab === "attendance" ? "Attendance Tracking" :
                   activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground truncate">
                  {activeTab === "overview" 
                    ? "Monitor and manage your entire learning platform"
                    : activeTab === "tutor-onboarding"
                    ? "Review and approve tutor applications"
                    : activeTab === "communication"
                    ? "Send notifications to students and tutors"
                    : activeTab === "attendance"
                    ? "Monitor and verify attendance records"
                    : `Managing ${activeTab}.`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
              <Button variant="outline" size="sm" onClick={handleExportReports} className="flex-1 sm:flex-none bg-card hover:bg-accent">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => openSendMessageDialog()}  className="flex-1 sm:flex-none bg-card hover:bg-accent">
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Messages</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleViewProfile} className="flex-1 sm:flex-none bg-card hover:bg-accent">
                <Shield className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
              {activeTab === "users" && (
                <Button onClick={() => setShowUserManagement(true)} className="flex-1 sm:flex-none">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Add User</span>
                </Button>
              )}
            </div>
          </div>

          {/* Content Area */}
          <main className="flex-1 px-4 sm:px-6 py-4 sm:py-8 overflow-auto w-full max-w-full bg-background">
            {/* Search Bar - Show on relevant pages */}
            {shouldShowSearch && ["users", "classes", "attendance", "reporting"].includes(activeTab) && (
              <div className="mb-6 flex justify-end w-full max-w-full">
                <SearchBar 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onFilterClick={handleFilterClick}
                />
              </div>
            )}

            {/* Filter Panel - Show when filters are expanded */}
          {showFilters && shouldShowSearch && (
            <div className="mb-6 p-4 border rounded-lg bg-accent/50 border-border">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Role Filter */}
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground mb-3">Filter by Role</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-card hover:bg-accent border-border"
                    >
                      All Roles
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-card hover:bg-accent border-border"
                    >
                      Admin
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-card hover:bg-accent border-border"
                    >
                      Tutor
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-card hover:bg-accent border-border"
                    >
                      Student
                    </Button>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground mb-3">Filter by Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-card hover:bg-accent border-border"
                    >
                      All Status
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-card hover:bg-accent border-border"
                    >
                      Active
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-card hover:bg-accent border-border text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Suspended
                    </Button>
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Active filters: None</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowFilters(false)}
                    className="text-xs h-7 hover:bg-accent"
                  >
                    Hide filters
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      // Clear filters logic here
                      setShowFilters(false);
                    }}
                    className="text-xs h-7 hover:bg-accent"
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            </div>
          )}

            {/* Tab Content */}
            <div className="w-full max-w-full min-w-0 overflow-x-hidden">
              {activeTab === "overview" && (
                <AdminOverview
                  systemStats={stats}
                  recentActivities={recent_activities}
                  platformAnalytics={[]}
                  onUserManagement={() => setShowUserManagement(true)}
                  onViewUsers={() => setActiveTab("users")}
                  onViewClasses={() => setActiveTab("classes")}
                  onViewTutorOnboarding={() => setActiveTab("tutor-onboarding")}
                  onViewReporting={() => setActiveTab("reporting")}
                  onSendNotification={() => setActiveTab("communication")}
                  onViewAttendance={() => setActiveTab("attendance")}
                />
              )}

              {activeTab === "users" && (
                <UsersTab 
                  users={users}
                  onAddUser={() => setShowUserManagement(true)}
                  searchQuery={searchQuery}
                  onRefresh={() => fetchTabData("users")}
                />
              )}

              {activeTab === "tutor-onboarding" && (
                <TutorOnboardingTab
                  pendingTutors={pending_tutors}
                  onApproveTutor={handleApproveTutor}
                  onRejectTutor={handleRejectTutor}
                  onRefresh={() => fetchTabData("tutor-onboarding")}
                  showDegreeVerification={true}
                />
              )}

              {activeTab === "classes" && (
                <ClassesTab 
                  classes={dashboardData.classes || []}
                  onSelectClass={setSelectedClass}
                  searchQuery={searchQuery}
                  onRefresh={() => fetchTabData("classes")}
                  onCreateClass={() => setShowCreateClass(true)}
                />
              )}

{activeTab === "pending-approvals" && (
  <PendingTutorialsTab
    searchQuery={searchQuery}
    onRefresh={() => fetchDashboardData()}
  />
)}

{activeTab === "assignments" && (
  <AssignmentsTab/>
)}

              {activeTab === "reporting" && (
                <ReportingTab
                  pendingReports={pending_reports}
                  onApproveReport={handleApproveReport}
                  searchQuery={searchQuery}
                  onRefresh={() => fetchTabData("reporting")}
                />
              )}

              {activeTab === "communication" && (
                <CommunicationTab
                  onSendNotification={handleSendNotification}
                />
              )}

              {activeTab === "attendance" && (
                <AttendanceTrackingTab
                  searchQuery={searchQuery}
                  onRefresh={() => fetchDashboardData()}
                />
              )}

              {activeTab === "analytics" && (
                <AnalyticsTab analytics={[]} /> // You can add analytics data later
              )}

              {activeTab === "email-queue" && (
                <EmailQueueTab />
              )}
            </div>
          </main>
        </div>

        {/* Dialogs */}
        <UserManagementDialog
          open={showUserManagement}
          onOpenChange={setShowUserManagement}
          onUserCreated={() => fetchTabData("users")}
        />

        <ManageClassDialog
          open={!!selectedClass}
          onOpenChange={(open) => !open && setSelectedClass(null)}
          classData={selectedClass}
          onClassUpdated={() => fetchTabData("classes")}
        />

        <CreateClassDialog
          open={showCreateClass}
          onOpenChange={setShowCreateClass}
          onClassCreated={() => {
            fetchTabData("classes");
            toast({
              title: "Success",
              description: "Class created successfully!",
            });
          }}
        />

        {/* Add the dialog component */}
        <SendMessageDialog
          open={showSendMessageDialog}
          onOpenChange={closeSendMessageDialog}
          user={selectedUserForMessage}
        />
      </div>
    </SidebarProvider>
  );
}

function SearchBar({ 
  searchQuery, 
  setSearchQuery
}: { 
  searchQuery: string; 
  setSearchQuery: (query: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search users, classes..."
          className="pl-10 w-full bg-card border-border text-foreground placeholder:text-muted-foreground"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button 
        variant="outline" 
        size="icon" 
        className="shrink-0 bg-card hover:bg-accent border-border"
      >
        <Filter className="w-4 h-4" />
      </Button>
    </div>
  );
}