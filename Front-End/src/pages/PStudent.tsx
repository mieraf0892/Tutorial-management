// student dashboard after paymetn
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UniversalSidebar } from "@/components/UniversalSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  BookOpen,
  Grid3X3,
  FileText,
  List,
  MessageCircle,
  BarChart3,
  Clock,
  CreditCard,
  User,
  Users,
  LayoutDashboard
} from "lucide-react";

// Import components
import QuickStats from "@/components/Student-Dashboard/QuickStats";
import ClassGrid from "@/components/Student-Dashboard/ClassGrid";
import ClassList from "@/components/Student-Dashboard/ClassList";
import StreamTab from "@/components/Student-Dashboard/StreamTab";
import WorkTab from "@/components/Student-Dashboard/WorkTab";
import ScheduleCalendar from "@/components/Student-Dashboard/ScheduleCalendar";
import FinanceTab from "@/components/Student-Dashboard/FinanceTab";
import CommunicationPanel from "@/components/Student-Dashboard/CommunicationPanel";
import ProgressTracking from "@/components/Student-Dashboard/ProgressTracking";
import AttendanceRecords from "@/components/Student-Dashboard/AttendanceRecords";
import StudentOverview from "@/components/Student-Dashboard/StudentOverview";
import DashboardLessonPlayer from "@/components/Student-Dashboard/DashboardLessonPlayer";

import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// ... interfaces remain the same ...

// Student-specific navigation items
const studentNavigationItems = [
  { title: "Overview", value: "overview", icon: LayoutDashboard },
  { title: "Stream", value: "stream", icon: BookOpen },
  { title: "My Tutorials", value: "classes", icon: Grid3X3 },
  { title: "To-do", value: "work", icon: FileText },
  { title: "Progress", value: "progress", icon: BarChart3 },
  { title: "Attendance", value: "attendance", icon: Users },
  { title: "Schedule", value: "schedule", icon: Clock },
  { title: "Finance", value: "finance", icon: CreditCard },
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [tutorialViewMode, setTutorialViewMode] = useState<"grid" | "list">("grid");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [showCommunication, setShowCommunication] = useState(false);
  
  // State for learning mode
  const [learningMode, setLearningMode] = useState(false);
  const [selectedTutorialId, setSelectedTutorialId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0); // ADD THIS LINE
  
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { toast } = useToast();

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
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Handle tutorial click - Enter learning mode
  const handleTutorialClick = (tutorial: EnrolledTutorial) => {
    setSelectedTutorialId(tutorial.id.toString());
    setLearningMode(true);
    setActiveTab('classes'); // Keep active tab as classes
  };

  // Exit learning mode
  const handleExitLearningMode = () => {
    setLearningMode(false);
    setSelectedTutorialId(null);
    // Refresh dashboard data when exiting learning mode
    fetchDashboardData();
  };
// 2. Add this function to fetch the price from PaymentController
const fetchPaymentPrice = async () => {
  try {
    const response = await apiClient.get("/student/payment-status");
    if (response.data.success) {
      setFinalPrice(response.data.amount_due);
    }
  } catch (error) {
    console.error("Failed to fetch price:", error);
  }
};
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/student/dashboard");
      const data = response.data;

      if (data.success) {
        setDashboardData(data.dashboard);
      } else {
        throw new Error(data.message || "Failed to load dashboard");
      }
    } catch (error: any) {
      console.error("Dashboard error:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to load student dashboard.",
        variant: "destructive",
      });

      if (error.response?.status === 401) {
        logout();
        navigate("/login?redirect=/student");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchUnreadCount();
    fetchPaymentPrice();
    // Poll for updates
    const interval = setInterval(fetchUnreadCount, 30000);
    
    // Set up real-time updates
    const eventSource = new EventSource('/api/student/updates');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message' || data.type === 'new_notification') {
        fetchDashboardData();
      }
    };

    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, []);

  const handleLogout = () => logout();
  const handleJoinClass = () => navigate("/tutorials");
  const handleJoinSession = (session: ScheduledSession) => {
    if (session.meeting_link) {
      window.open(session.meeting_link, '_blank');
    } else {
      toast({
        title: "No meeting link",
        description: "Meeting link not available yet.",
        variant: "destructive",
      });
    }
  };

  const handleMakePayment = (tutorialId: number) => {
    navigate(`/payment/${tutorialId}`);
  };

  const handleViewProfile = () => {
    navigate("/student/profile");
  };

  const handleChatWithTutor = (tutorId: number) => {
    setShowCommunication(true);
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
            navigationItems={studentNavigationItems}
            userRole="student"
            userName={user?.name}
          />
          <div className="flex-1 flex items-center justify-center w-full overflow-x-hidden">
            <div className="text-center text-lg text-foreground">Loading your dashboard...</div>
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
            navigationItems={studentNavigationItems}
            userRole="student"
            userName={user?.name}
          />
          <div className="flex-1 flex items-center justify-center w-full overflow-x-hidden">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Unable to load dashboard
              </h2>
              <Button onClick={fetchDashboardData}>Retry</Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const { 
    student, 
    stats, 
    enrolled_tutorials, 
    recent_activities, 
    upcoming_lessons,
    scheduled_sessions,
    payment_history,
  } = dashboardData;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full overflow-x-hidden">
        {/* Sidebar - Show in both modes */}
        <UniversalSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (learningMode) {
              // If in learning mode and trying to switch tabs, confirm exit
              if (window.confirm("Exit learning mode and go to dashboard?")) {
                handleExitLearningMode();
                setActiveTab(tab);
              }
            } else {
              setActiveTab(tab);
            }
          }}
          onLogout={handleLogout}
          onOpenMessages={() => setShowCommunication(true)}
          navigationItems={studentNavigationItems}
          userRole="student"
          userName={student.name || user?.name}
          unreadMessages={unreadCount}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
          {/* Header - Only show in dashboard mode */}
          {!learningMode && (
            <div className="bg-card border-b border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full max-w-full">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <SidebarTrigger />
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                    {activeTab === "overview" ? "My Learning Dashboard" : 
                     activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground truncate">
                    {`Welcome back, ${student.name || user?.name || "Student"}! ${activeTab === "overview" 
                      ? "Here's your learning overview."
                      : `Managing ${activeTab}.`}`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowCommunication(true)} 
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
                <Button variant="outline" size="sm" onClick={handleViewProfile} className="flex-1 sm:flex-none">
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleJoinClass} className="flex-1 sm:flex-none">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Browse</span>
                </Button>
              </div>
            </div>
          )}

          {/* Content Area */}
          <main className="flex-1 px-4 sm:px-6 py-4 sm:py-8 overflow-auto w-full max-w-full">
            {/* LEARNING MODE */}
            {learningMode && selectedTutorialId ? (
              <DashboardLessonPlayer
                tutorialId={selectedTutorialId}
                onExitLearningMode={handleExitLearningMode}
              />
            ) : (
              /* DASHBOARD MODE */
              <>
                {/* Show stats only on overview page */}
                {shouldShowStats && stats && (
                  <div className="w-full max-w-full mb-6">
                    <QuickStats stats={stats} />
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

                {/* Tab Content */}
                <div className="w-full max-w-full min-w-0 overflow-x-hidden">
                  {activeTab === "overview" && (
                    <StudentOverview
                      stats={stats}
                      enrolledTutorials={enrolled_tutorials}
                      recentActivities={recent_activities}
                      upcomingLessons={upcoming_lessons}
                      scheduledSessions={scheduled_sessions}
                      paymentHistory={payment_history}
                      onViewTutorials={() => setActiveTab("classes")}
                      onViewSchedule={() => setActiveTab("schedule")}
                      onJoinClass={handleJoinClass}
                    />
                  )}

                  {activeTab === "stream" && (
                    <StreamTab
                      recentActivities={recent_activities}
                      upcomingLessons={upcoming_lessons}
                      scheduledSessions={scheduled_sessions}
                      onJoinSession={handleJoinSession}
                    />
                  )}
                  
                  {activeTab === "classes" && (
                    <div className="w-full min-w-0 overflow-x-hidden">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 w-full min-w-0">
                        <div className="min-w-0 flex-1">
                          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                            My Tutorials
                          </h2>
                          <p className="text-sm sm:text-base text-muted-foreground">
                            {enrolled_tutorials.length > 0
                              ? "Click on a tutorial to continue learning"
                              : "You haven't enrolled in any tutorials yet"}
                          </p>
                        </div>
                        {enrolled_tutorials.length > 0 && (
                          <ViewModeToggle
                            viewMode={tutorialViewMode}
                            setViewMode={setTutorialViewMode}
                          />
                        )}
                      </div>

                      {enrolled_tutorials.length > 0 ? (
                        tutorialViewMode === "grid" ? (
                          <ClassGrid 
                            tutorials={enrolled_tutorials} 
                            onChatWithTutor={handleChatWithTutor}
                            onTutorialClick={handleTutorialClick}
                          />
                        ) : (
                          <ClassList 
                            tutorials={enrolled_tutorials}
                            onChatWithTutor={handleChatWithTutor}
                            onTutorialClick={handleTutorialClick}
                          />
                        )
                      ) : (
                        <div className="w-full text-center py-8 sm:py-12 border-2 border-dashed border-border rounded-lg min-w-0 bg-card">
                          <BookOpen className="mx-auto h-8 sm:h-12 w-8 sm:w-12 text-muted-foreground" />
                          <h3 className="mt-3 sm:mt-4 text-lg font-medium text-foreground">
                            No tutorials yet
                          </h3>
                          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
                            Get started by enrolling in your first tutorial.
                          </p>
                          <Button onClick={handleJoinClass} className="mt-3 sm:mt-4">
                            <Plus className="w-4 h-4 mr-2" />
                            Browse Tutorials
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "work" && (
                    <WorkTab 
                      upcomingLessons={upcoming_lessons} 
                      stats={stats} 
                    />
                  )}

                  {activeTab === "progress" && (
                    <ProgressTracking 
                      tutorials={enrolled_tutorials}
                      stats={stats}
                      recentActivities={recent_activities}
                    />
                  )}

                  {activeTab === "schedule" && (
                    <ScheduleCalendar 
                      sessions={scheduled_sessions}
                      onJoinSession={handleJoinSession}
                    />
                  )}
        
                  {activeTab === "attendance" && (
                    <AttendanceRecords 
                      tutorials={enrolled_tutorials}
                      stats={stats}
                      scheduledSessions={scheduled_sessions}
                    />
                  )}

                  {activeTab === "finance" && (
                    <FinanceTab 
                      paymentHistory={payment_history}
                      stats={stats}
                      onMakePayment={handleMakePayment}
                    />
                  )}
                </div>
              </>
            )}
          </main>
        </div>
        
        {/* Communication Panel */}
        {showCommunication && (
          <CommunicationPanel 
            onClose={() => {
              setShowCommunication(false);
              fetchUnreadCount();
            }}
            studentId={user?.id ? Number(user.id) : undefined}
            onUnreadCountChange={setUnreadCount}
          />
        )}
      </div>
    </SidebarProvider>
  );
}

function ViewModeToggle({
  viewMode,
  setViewMode,
}: {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={viewMode === "grid" ? "default" : "outline"}
        size="icon"
        onClick={() => setViewMode("grid")}
      >
        <Grid3X3 className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "outline"}
        size="icon"
        onClick={() => setViewMode("list")}
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
}