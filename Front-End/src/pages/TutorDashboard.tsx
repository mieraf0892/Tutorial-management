// TutorDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UniversalSidebar } from "@/components/UniversalSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Plus,
  Search,
  BookOpen,
  Users,
  Clock,
  CreditCard,
  ClipboardList,
  User,
  MessageCircle,
  Upload,
  CheckCircle,
  LayoutDashboard,
  FileText
} from "lucide-react";

// Components
import TutorQuickStats from "@/components/Tutor-Dashboard/TutorQuickStats";
import AssignmentsTab from "@/components/Tutor-Dashboard/AssignmentsTab";
import TutorialsTab from "@/components/Tutor-Dashboard/TutorialsTab";
import SessionsTab from "@/components/Tutor-Dashboard/SessionsTab";
import StudentsTab from "@/components/Tutor-Dashboard/StudentsTab";
import AttendanceTab from "@/components/Tutor-Dashboard/AttendanceTab";
import ScheduleTab from "@/components/Tutor-Dashboard/ScheduleTab";
import FinanceTab from "@/components/Tutor-Dashboard/FinanceTab";
import ContentTab from "@/components/Tutor-Dashboard/ContentTab";
import CreateTutorialDialog from "@/components/Tutor-Dashboard/CreateTutorialDialog";
import CommunicationPanel from "@/components/Student-Dashboard/CommunicationPanel";
import TutorOverview from "@/components/Tutor-Dashboard/TutorOverview"; // New component

import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import AcceptedCoursesTab from "@/components/Tutor-Dashboard/AcceptedCoursesTab";

// Sidebar items - Added Overview as first item
const tutorNavigationItems = [
  { title: "Overview", value: "overview", icon: LayoutDashboard },
  { title: "My Assignments", value: "assignments", icon: ClipboardList },
  { title: "My Courses", value: "courses", icon: BookOpen }, // NEW
  { title: "My Tutorials", value: "tutorials", icon: FileText },
  { title: "Sessions", value: "sessions", icon: Clock },
  { title: "Attendance", value: "attendance", icon: CheckCircle },
  { title: "Students", value: "students", icon: Users },
  { title: "Content", value: "content", icon: Upload },
  { title: "Schedule", value: "schedule", icon: Calendar },
  { title: "Finance", value: "finance", icon: CreditCard },
];

export default function TutorDashboard() {
  const [activeTab, setActiveTab] = useState("overview"); // Default to overview
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCommunication, setShowCommunication] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null); 

  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { toast } = useToast();

  // Add unread messages count state and fetch function
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread messages count
  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/messages/conversations');
      if (response.data.success) {
        const total = response.data.conversations.reduce(
          (sum: number, conv: any) => sum + (conv.unread_count || 0), 
          0
        );
        setUnreadCount(total);
        console.log('Tutor - Refreshed unread count:', total);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const [courseForTutorial, setCourseForTutorial] = useState<{
    id: number;
    title: string;
  } | null>(null);

  // Poll for unread messages every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/tutor/dashboard");
      const data = response.data;

      if (data.success) {
        setDashboardData(data.dashboard);
      } else {
        throw new Error(data.message || "Failed to load dashboard");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load tutor dashboard.",
        variant: "destructive",
      });
      if (error.response?.status === 401) {
        logout();
        navigate("/login?redirect=/tutor");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates for messages
    const eventSource = new EventSource('/api/tutor/updates');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        fetchUnreadCount(); // Refresh unread count
      }
    };

    return () => eventSource.close();
  }, []);

  const handleLogout = () => logout();
  const handleTutorialCreated = () => {
    fetchDashboardData();
    setCourseForTutorial(null); // Reset
  };

  const handleStartSession = (session: any) => {
    if (session.meeting_link) window.open(session.meeting_link, "_blank");
    else
      toast({
        title: "No meeting link",
        description: "Please set up a meeting link first.",
        variant: "destructive",
      });
  };

  const handleMarkAttendance = async (sessionId: number, attendanceData: any) => {
    try {
      const response = await apiClient.post(`/tutor/sessions/${sessionId}/attendance`, attendanceData);
      if (response.data.success) {
        toast({ title: "Success", description: "Attendance marked successfully" });
        fetchDashboardData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to mark attendance",
        variant: "destructive",
      });
    }
  };

  const handleMessageStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setShowCommunication(true);
  };

  // Update the CommunicationPanel to accept the selected student
  const handleCloseCommunication = () => {
    setShowCommunication(false);
    setSelectedStudentId(null);
    fetchUnreadCount(); // Refresh badge when panel closes
  };

  // Check if current tab should show stats (only overview)
  const shouldShowStats = activeTab === "overview";

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-background flex w-full overflow-x-hidden">
          <UniversalSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            onOpenMessages={() => {
              setShowCommunication(true);
              setSelectedStudentId(null);
            }}
            navigationItems={tutorNavigationItems}
            userRole="tutor"
            userName={dashboardData?.tutor.name || user?.name}
            unreadMessages={unreadCount} // Use the new unreadCount state
          />
          <div className="flex-1 flex items-center justify-center w-full overflow-x-hidden">
            <div className="text-center text-lg text-foreground">Loading your dashboard...</div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full overflow-x-hidden">
        {/* Sidebar */}
        <UniversalSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          onOpenMessages={() => {
            setShowCommunication(true);
            setSelectedStudentId(null);
          }}
          navigationItems={tutorNavigationItems}
          userRole="tutor"
          userName={dashboardData?.tutor.name || user?.name}
          unreadMessages={unreadCount} // Use the new unreadCount state
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
          {/* Header */}
          <div className="bg-card border-b border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full max-w-full">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <SidebarTrigger />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {activeTab === "overview" ? "Tutor Dashboard" : 
                   activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground truncate">
                  Welcome back, {dashboardData?.tutor.name || user?.name}!{" "}
                  {activeTab === "overview" 
                    ? "Here's your dashboard overview."
                    : `Managing ${activeTab}.`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
              {/* Updated Messages Button with Notification Badge */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowCommunication(true);
                  setSelectedStudentId(null);
                }} 
                className="flex-1 sm:flex-none relative"
              >
                <div className="relative">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="ml-1">Messages</span>
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => navigate("/tutor/profile")} className="flex-1 sm:flex-none">
                <User className="w-4 h-4 mr-2" /> 
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <main className="flex-1 px-4 sm:px-6 py-4 sm:py-8 overflow-auto w-full max-w-full">
            {/* Show stats only on overview page */}
            {shouldShowStats && dashboardData?.stats && (
              <div className="w-full max-w-full mb-6">
                <TutorQuickStats stats={dashboardData.stats} />
              </div>
            )}

            {/* Search Bar - Show on all pages except overview */}
            {activeTab !== "overview" && (
              <div className="mb-6 flex justify-end w-full max-w-full">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder={`Search ${activeTab}...`} 
                    className="pl-10 w-full sm:w-64" 
                  />
                </div>
              </div>
            )}

            {/* Tab Content - Wrapped in full-width container */}
            <div className="w-full max-w-full min-w-0 overflow-x-hidden">
              {activeTab === "overview" && (
                <TutorOverview
                  stats={dashboardData?.stats}
                  students={dashboardData?.recent_students || []}
                  tutorials={dashboardData?.tutorials || []}
                  upcomingSessions={dashboardData?.upcoming_sessions || []}
                  recentPayments={dashboardData?.recent_payments || []}
                  onCreateTutorial={() => setShowCreateDialog(true)} 
                />
              )}

              {activeTab === "assignments" && (
                <AssignmentsTab
                  onAssignmentAccepted={fetchDashboardData}
                  onAssignmentRejected={fetchDashboardData}
                />  
              )}

              {activeTab === "tutorials" && (
                <TutorialsTab
                  tutorials={dashboardData?.tutorials || []}
                  onTutorialUpdate={fetchDashboardData}
                />
              )}

              {activeTab === "courses" && (
                <AcceptedCoursesTab
                  onCreateTutorial={(courseId, courseTitle) => {
                    setCourseForTutorial({ id: courseId, title: courseTitle });
                    setShowCreateDialog(true);
                  }}
                />  
              )}

              {activeTab === "sessions" && (
                <SessionsTab
                  sessions={dashboardData?.upcoming_sessions || []}
                  onStartSession={handleStartSession}
                  onMarkAttendance={handleMarkAttendance}
                />
              )}

              {activeTab === "attendance" && (
                <AttendanceTab
                  sessions={dashboardData?.upcoming_sessions || []}
                  onMarkAttendance={handleMarkAttendance}
                />
              )}

              {activeTab === "students" && (
                <StudentsTab
                  students={dashboardData?.recent_students || []}
                  tutorials={dashboardData?.tutorials || []}
                  onMessageStudent={handleMessageStudent}
                />
              )}

              {activeTab === "content" && (
                <ContentTab tutorials={dashboardData?.tutorials || []} />
              )}

              {activeTab === "schedule" && (
                <ScheduleTab sessions={dashboardData?.upcoming_sessions || []} />
              )}

              {activeTab === "finance" && (
                <FinanceTab
                  payments={dashboardData?.recent_payments || []}
                  stats={dashboardData?.stats}
                />
              )}
            </div>
          </main>
        </div>

        {/* Communication Panel */}
        {showCommunication && (
          <CommunicationPanel
            onClose={handleCloseCommunication}
            initialStudentId={selectedStudentId}
            tutorId={user?.id ? Number(user.id) : undefined}
            onUnreadCountChange={setUnreadCount}
          />
        )}

        {/* Create Tutorial Dialog */}
        <CreateTutorialDialog
          open={showCreateDialog}
          onOpenChange={(open) => {
            setShowCreateDialog(open);
              if (!open) {
                setCourseForTutorial(null); // Reset when dialog closes
              }
            }}
          onTutorialCreated={handleTutorialCreated}
          courseId={courseForTutorial?.id}
          courseTitle={courseForTutorial?.title}
        />
      </div>
    </SidebarProvider>
  );
}