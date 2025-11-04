// AdminDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserManagementDialog } from "@/components/dialogs/UserManagementDialog";
import { ManageClassDialog } from "@/components/dialogs/ManageClassDialog";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Download, Search, Filter, Shield } from "lucide-react";

// Import components
import OverviewTab from "@/components/Admin-Dashboard/OverviewTab";
import UsersTab from "@/components/Admin-Dashboard/UsersTab";
import ClassesTab from "@/components/Admin-Dashboard/ClassesTab";
import AnalyticsTab from "@/components/Admin-Dashboard/AnalyticsTab";

// Import data (for fallback)
import { systemStats, recentUsers, popularClasses, platformAnalytics, recentActivities } from "@/data/admin-data";

interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
  created_at: string;
  student?: any;
  tutor?: any;
}

interface SystemStats {
  total_users: number;
  total_students: number;
  total_tutors: number;
  pending_verifications: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Real data from backend
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('auth_token');

        const statsResponse = await fetch('http://192.168.1.3:8000/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        
        // Fetch users data
        const usersResponse = await fetch('http://localhost:8000/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (usersResponse.ok && statsResponse.ok) {
          const statsData = await statsResponse.json();
          const usersData = await usersResponse.json();
          setUsers(usersData.users || []);
          
          // Calculate real stats from users data
          const realStats: SystemStats = {
            total_users: usersData.users.length,
            total_students: usersData.users.filter((u: User) => u.role === 'student').length,
            total_tutors: usersData.users.filter((u: User) => u.role === 'tutor').length,
            pending_verifications: usersData.users.filter((u: User) => 
              u.role === 'tutor' && u.tutor && !u.tutor.is_verified
            ).length
          };
          
          setSystemStats(realStats);
          
          // Generate recent activities from users
          const activities = usersData.users
            .slice(0, 5)
            .map((user: User) => ({
              id: user.id,
              user: user.name,
              action: `Registered as ${user.role}`,
              time: new Date(user.created_at).toLocaleDateString(),
              type: user.role === 'student' ? 'student' : 
                    user.role === 'tutor' ? 'tutor' : 'admin'
            }));
          setRecentActivities(activities);
          
        } else {
          throw new Error('Failed to fetch admin data');
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast({
          title: "Error",
          description: "Failed to load admin dashboard data",
          variant: "destructive"
        });
        
        // Fallback to mock data if API fails
        setSystemStats({
          total_users: recentUsers.length,
          total_students: recentUsers.filter(u => u.role === 'student').length,
          total_tutors: recentUsers.filter(u => u.role === 'tutor').length,
          pending_verifications: recentUsers.filter(u => u.role === 'tutor' && u.status === 'pending').length
        });
        setUsers(recentUsers);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user, toast]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleExportReports = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      // You can implement export functionality here
      toast({
        title: "Export Started",
        description: "Your reports are being prepared for download.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate reports.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar userRole="admin" onLogout={handleLogout} />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Monitor and manage your entire learning platform</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleExportReports}>
                <Download className="w-4 h-4 mr-2" />
                Export Reports
              </Button>
              <Button onClick={() => setShowUserManagement(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Administrator</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid w-full md:w-auto grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <SearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          <TabsContent value="overview">
            <OverviewTab 
              systemStats={systemStats || {
                total_users: 0,
                total_students: 0,
                total_tutors: 0,
                pending_verifications: 0
              }}
              recentActivities={recentActivities}
              platformAnalytics={platformAnalytics}
              onUserManagement={() => setShowUserManagement(true)}
            />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab 
              users={users}
              onAddUser={() => setShowUserManagement(true)}
              searchQuery={searchQuery}
            />
          </TabsContent>

          <TabsContent value="classes">
            <ClassesTab 
              classes={popularClasses}
              onSelectClass={setSelectedClass}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab analytics={platformAnalytics} />
          </TabsContent>
        </Tabs>
      </main>

      <UserManagementDialog
        open={showUserManagement}
        onOpenChange={setShowUserManagement}
      />

      <ManageClassDialog
        open={!!selectedClass}
        onOpenChange={(open) => !open && setSelectedClass(null)}
        classData={selectedClass || {
          name: "",
          tutor: "",
          students: 0,
          rating: 0,
          subject: "",
          color: "",
          enrollmentCode: "",
          assignments: 0,
          active: true,
          completionRate: 0
        }}
      />
    </div>
  );
}

function SearchBar({ searchQuery, setSearchQuery }: { 
  searchQuery: string; 
  setSearchQuery: (query: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search users, classes..."
          className="pl-10 w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button variant="outline" size="icon">
        <Filter className="w-4 h-4" />
      </Button>
    </div>
  );
}