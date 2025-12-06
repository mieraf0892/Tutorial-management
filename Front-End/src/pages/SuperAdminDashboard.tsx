// src/pages/SuperAdminDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UniversalSidebar } from "@/components/UniversalSidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  LayoutDashboard, Users, Key, DollarSign, 
  BookOpen, BarChart3, Server, Settings,
  Shield, Database, Cpu, FileText
} from "lucide-react";
import { apiClient } from "@/lib/api";

// Import Super Admin specific components
import SuperAdminOverview from "@/components/SuperAdmin-Dashboard/SuperAdminOverview";
import AdminManagementTab from "@/components/SuperAdmin-Dashboard/AdminManagementTab";
import RoleConfigurationTab from "@/components/SuperAdmin-Dashboard/RoleConfigurationTab";
import FinanceOversightTab from "@/components/SuperAdmin-Dashboard/FinanceOversightTab";
import SystemControlTab from "@/components/SuperAdmin-Dashboard/SystemControlTab";
import DatabaseManagementTab from "@/components/SuperAdmin-Dashboard/DatabaseManagementTab";

interface SystemStats {
  total_users: number;
  total_admins: number;
  total_financial_admins: number;
  total_user_admins: number;
  pending_approvals: number;
  total_revenue: number;
  pending_payouts: number;
  system_health: 'healthy' | 'warning' | 'critical';
  database_size: string;
  active_sessions: number;
  total_classes: number;
  active_classes: number;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'financial_admin' | 'user_admin' | 'content_admin' | 'super_admin';
  permissions: string[];
  last_active: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

interface FinancialReport {
  id: number;
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: string;
  submitted_at: string;
}

interface SystemLog {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning';
  details: string;
}

// Super Admin navigation items
const superAdminNavigationItems = [
  { title: "Dashboard", value: "overview", icon: LayoutDashboard },
  { title: "Admin Management", value: "admin-management", icon: Users },
  { title: "Role Configuration", value: "role-config", icon: Key },
  { title: "Finance Oversight", value: "finance", icon: DollarSign },
  { title: "System Control", value: "system", icon: Server },
  { title: "Database", value: "database", icon: Database },
  { title: "Security", value: "security", icon: Shield },
  { title: "Settings", value: "settings", icon: Settings },
];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  
  // System data
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  const fetchSuperAdminData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching super admin data from backend...");
      
      // Fetch all super admin data in parallel
      const [statsResponse, adminsResponse, financeResponse, logsResponse] = await Promise.all([
        apiClient.get("/super-admin/system-stats"),
        apiClient.get("/super-admin/admins"),
        apiClient.get("/super-admin/financial-reports?status=pending"),
        apiClient.get("/super-admin/system-logs?limit=10")
      ]);

      console.log("✅ Backend responses:", {
        stats: statsResponse.data,
        admins: adminsResponse.data,
        finance: financeResponse.data,
        logs: logsResponse.data
      });

      // Handle responses
      if (statsResponse.data?.success) {
        setSystemStats(statsResponse.data.data);
      } else if (statsResponse.data) {
        // If no success field, assume direct data
        setSystemStats(statsResponse.data);
      }

      if (adminsResponse.data?.success) {
        setAdminUsers(adminsResponse.data.data);
      } else if (adminsResponse.data?.admins) {
        setAdminUsers(adminsResponse.data.admins);
      }

      if (financeResponse.data?.success) {
        setFinancialReports(financeResponse.data.data);
      } else if (financeResponse.data?.reports) {
        setFinancialReports(financeResponse.data.reports);
      }

      if (logsResponse.data?.success) {
        setSystemLogs(logsResponse.data.data);
      } else if (logsResponse.data?.logs) {
        setSystemLogs(logsResponse.data.logs);
      }

      setDataFetched(true);

    } catch (error: any) {
      console.error('❌ Error fetching super admin data:', error);
      
      // Provide detailed error information
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          "Failed to connect to backend services";
      
      toast({
        title: "Backend Connection Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Fallback data for development
      console.log("🔄 Using fallback data for development");
      setSystemStats({
        total_users: 1250,
        total_admins: 8,
        total_financial_admins: 3,
        total_user_admins: 4,
        pending_approvals: 12,
        total_revenue: 154200,
        pending_payouts: 45200,
        system_health: 'healthy',
        database_size: '2.4 GB',
        active_sessions: 47,
        total_classes: 89,
        active_classes: 67
      });

      setAdminUsers([
        {
          id: 1,
          name: "Financial Admin",
          email: "finance@tutorialhub.com",
          role: "financial_admin",
          permissions: ["financial_reports", "payout_approval"],
          last_active: new Date().toISOString(),
          status: "active",
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: "User Admin",
          email: "users@tutorialhub.com",
          role: "user_admin",
          permissions: ["user_management", "role_assignment"],
          last_active: new Date().toISOString(),
          status: "active",
          created_at: new Date().toISOString()
        }
      ]);

      setFinancialReports([
        {
          id: 1,
          period: "January 2024",
          revenue: 45000,
          expenses: 12000,
          profit: 33000,
          status: "pending",
          submitted_by: "Financial Admin",
          submitted_at: new Date().toISOString()
        }
      ]);

      setDataFetched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSystemAction = async (action: string, data?: any) => {
    try {
      console.log(`🔄 Executing system action: ${action}`, data);
      
      let response;
      switch (action) {
        case 'suspend_admin':
          response = await apiClient.put(`/super-admin/admins/${data.adminId}/suspend`);
          break;
        case 'activate_admin':
          response = await apiClient.put(`/super-admin/admins/${data.adminId}/activate`);
          break;
        case 'reset_password':
          response = await apiClient.post(`/super-admin/admins/${data.adminId}/reset-password`);
          break;
        case 'update_permission':
          response = await apiClient.put(`/super-admin/roles/${data.roleId}/permissions`, {
            permission: data.permissionId,
            enabled: data.enabled
          });
          break;
        case 'approve_financial_report':
          response = await apiClient.put(`/super-admin/financial-reports/${data.reportId}/approve`);
          break;
        case 'reject_financial_report':
          response = await apiClient.put(`/super-admin/financial-reports/${data.reportId}/reject`);
          break;
        case 'clear_cache':
          response = await apiClient.post("/super-admin/system/clear-cache");
          break;
        case 'restart_services':
          response = await apiClient.post("/super-admin/system/restart-services");
          break;
        case 'run_backup':
          response = await apiClient.post("/super-admin/database/backup");
          break;
        case 'security_scan':
          response = await apiClient.post("/super-admin/security/scan");
          break;
        case 'toggle_setting':
          response = await apiClient.put("/super-admin/settings", {
            [data.settingId]: data.enabled
          });
          break;
        case 'create_backup':
          response = await apiClient.post("/super-admin/database/backup");
          break;
        case 'run_maintenance':
          response = await apiClient.post("/super-admin/database/maintenance", {
            task: data.taskId
          });
          break;
        case 'execute_query':
          response = await apiClient.post("/super-admin/database/query", {
            query: data.query
          });
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      if (response.data?.success) {
        toast({
          title: "Action Completed",
          description: `System action '${action}' executed successfully`,
        });
        
        // Refresh relevant data based on action
        if (action.includes('admin')) {
          fetchAdminData();
        } else if (action.includes('financial')) {
          fetchFinancialData();
        } else if (action.includes('system') || action.includes('database')) {
          fetchSystemData();
        } else {
          fetchSuperAdminData(); // Full refresh
        }
        
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Action failed');
      }

    } catch (error: any) {
      console.error(`❌ System action failed: ${action}`, error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          `Failed to execute ${action}`;
      
      toast({
        title: "Action Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  // Separate data fetching functions for partial updates
  const fetchAdminData = async () => {
    try {
      const response = await apiClient.get("/super-admin/admins");
      if (response.data?.success) {
        setAdminUsers(response.data.data);
      } else if (response.data?.admins) {
        setAdminUsers(response.data.admins);
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    }
  };

  const fetchFinancialData = async () => {
    try {
      const response = await apiClient.get("/super-admin/financial-reports?status=pending");
      if (response.data?.success) {
        setFinancialReports(response.data.data);
      } else if (response.data?.reports) {
        setFinancialReports(response.data.reports);
      }
    } catch (error) {
      console.error("Failed to fetch financial data:", error);
    }
  };

  const fetchSystemData = async () => {
    try {
      const response = await apiClient.get("/super-admin/system-stats");
      if (response.data?.success) {
        setSystemStats(response.data.data);
      } else if (response.data) {
        setSystemStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch system data:", error);
    }
  };

  useEffect(() => {
    if (authLoading) {
      console.log("⏳ Authentication loading...");
      return;
    }
    
    if (!user) {
      console.log("🚫 No user, redirecting to login");
      navigate("/login");
      return;
    }

    // Check if user is actually super admin
    if (user.role !== 'super_admin') {
      console.log("🚫 User is not super admin, redirecting to admin dashboard");
      toast({
        title: "Access Denied",
        description: "Super Admin privileges required to access this page",
        variant: "destructive"
      });
      navigate("/admin");
      return;
    }

    if (!dataFetched) {
      console.log("✅ User is super admin, fetching data...");
      fetchSuperAdminData();
    }
  }, [user, authLoading, dataFetched, navigate, toast]);

  const handleLogout = () => {
    console.log("🚪 Logging out super admin");
    logout();
    navigate("/login");
  };

  if (authLoading || (user && !dataFetched && loading)) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-gray-50 flex">
          <UniversalSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            navigationItems={superAdminNavigationItems}
            userRole="super_admin"
            userName={user?.name}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg mb-2">Loading Super Admin System...</div>
              <div className="text-sm text-gray-600">Connecting to backend services</div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        {/* Sidebar */}
        <UniversalSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          navigationItems={superAdminNavigationItems}
          userRole="super_admin"
          userName={user?.name}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === "overview" ? "Super Admin Dashboard" : 
                   activeTab === "admin-management" ? "Admin Management" :
                   activeTab === "role-config" ? "Role Configuration" :
                   activeTab === "finance" ? "Financial Oversight" :
                   activeTab === "system" ? "System Control" :
                   activeTab === "database" ? "Database Management" :
                   activeTab === "security" ? "Security Center" :
                   "System Settings"}
                </h1>
                <p className="text-gray-600">
                  {activeTab === "overview" 
                    ? "Full system control and oversight"
                    : activeTab === "admin-management"
                    ? "Manage all admin roles and permissions"
                    : activeTab === "role-config"
                    ? "Configure user roles and access levels"
                    : activeTab === "finance"
                    ? "Oversee financial reports and payouts"
                    : activeTab === "system"
                    ? "Core system controls and operations"
                    : activeTab === "database"
                    ? "Database management and maintenance"
                    : activeTab === "security"
                    ? "Security monitoring and controls"
                    : "System-wide configuration"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full border border-red-200">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Super Administrator</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <main className="flex-1 px-6 py-8 overflow-auto w-full">
            <div className="w-full max-w-full min-w-0">
              {activeTab === "overview" && (
                <SuperAdminOverview 
                  stats={systemStats}
                  onTabChange={setActiveTab}
                  systemLogs={systemLogs}
                />
              )}

              {activeTab === "admin-management" && (
                <AdminManagementTab 
                  admins={adminUsers}
                  onAdminUpdate={handleSystemAction}
                />
              )}

              {activeTab === "role-config" && (
                <RoleConfigurationTab 
                  onRoleUpdate={handleSystemAction}
                  currentAdmins={adminUsers}
                />
              )}

              {activeTab === "finance" && (
                <FinanceOversightTab 
                  reports={financialReports}
                  onApproveReport={handleSystemAction}
                  stats={systemStats}
                />
              )}

              {activeTab === "system" && (
                <SystemControlTab 
                  onSystemAction={handleSystemAction}
                  systemHealth={systemStats?.system_health}
                  systemLogs={systemLogs}
                />
              )}

              {activeTab === "database" && (
                <DatabaseManagementTab 
                  onDatabaseAction={handleSystemAction}
                  databaseSize={systemStats?.database_size}
                />
              )}

              {activeTab === "security" && (
                <SecurityCenterTab 
                  onSecurityAction={handleSystemAction}
                  systemLogs={systemLogs}
                />
              )}

              {activeTab === "settings" && (
                <SystemSettingsTab 
                  onSettingsUpdate={handleSystemAction}
                  currentSettings={systemStats}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// Enhanced Security Center Tab with backend integration
function SecurityCenterTab({ onSecurityAction, systemLogs }: { 
  onSecurityAction: (action: string, data?: any) => void;
  systemLogs: SystemLog[];
}) {
  const handleSecurityScan = () => {
    onSecurityAction('security_scan');
  };

  const handleAuditLogs = () => {
    onSecurityAction('get_audit_logs');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Security Center</h2>
          <p className="text-gray-600">Security monitoring and controls</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSecurityScan}>
            <Shield className="w-4 h-4 mr-2" />
            Run Security Scan
          </Button>
          <Button variant="outline" onClick={handleAuditLogs}>
            <FileText className="w-4 h-4 mr-2" />
            View Audit Logs
          </Button>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-1">System Security</h3>
            <p className="text-2xl font-bold text-green-600">Secure</p>
            <p className="text-sm text-gray-600 mt-1">No threats detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-1">Last Scan</h3>
            <p className="text-2xl font-bold">2 hours</p>
            <p className="text-sm text-gray-600 mt-1">Ago</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Cpu className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-1">Active Sessions</h3>
            <p className="text-2xl font-bold">47</p>
            <p className="text-sm text-gray-600 mt-1">Monitored</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest security-related system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemLogs.filter(log => log.action.includes('security') || log.status === 'error').slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center space-x-3 p-3 border rounded">
                {log.status === 'success' ? (
                  <Shield className="w-4 h-4 text-green-500" />
                ) : log.status === 'error' ? (
                  <Shield className="w-4 h-4 text-red-500" />
                ) : (
                  <Shield className="w-4 h-4 text-yellow-500" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-gray-500">{log.details}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  <p className="text-xs text-gray-400">{log.user}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced System Settings Tab
function SystemSettingsTab({ onSettingsUpdate, currentSettings }: { 
  onSettingsUpdate: (action: string, data?: any) => void;
  currentSettings: any;
}) {
  const [settings, setSettings] = useState({
    platform_name: "TutorialHub",
    maintenance_mode: false,
    debug_mode: false,
    auto_backup: true,
    email_notifications: true
  });

  const handleSaveSettings = () => {
    onSettingsUpdate('update_settings', settings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-gray-600">System-wide configuration and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Basic system configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platformName">Platform Name</Label>
              <Input
                id="platformName"
                value={settings.platform_name}
                onChange={(e) => setSettings({...settings, platform_name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode" className="font-medium">Maintenance Mode</Label>
                <p className="text-sm text-gray-600">Put the system in maintenance mode</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) => setSettings({...settings, maintenance_mode: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="debugMode" className="font-medium">Debug Mode</Label>
                <p className="text-sm text-gray-600">Enable detailed logging and debugging</p>
              </div>
              <Switch
                id="debugMode"
                checked={settings.debug_mode}
                onCheckedChange={(checked) => setSettings({...settings, debug_mode: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoBackup" className="font-medium">Auto Backup</Label>
                <p className="text-sm text-gray-600">Automatically backup database daily</p>
              </div>
              <Switch
                id="autoBackup"
                checked={settings.auto_backup}
                onCheckedChange={(checked) => setSettings({...settings, auto_backup: checked})}
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings}>
            <Settings className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Import UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";