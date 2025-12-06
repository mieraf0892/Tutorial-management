// src/components/SuperAdmin-Dashboard/SuperAdminOverview.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, Shield, DollarSign, Database, 
  Cpu, CheckCircle, XCircle, AlertTriangle,
  ArrowRight, Server, Key, FileText
} from "lucide-react";

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
}

interface SuperAdminOverviewProps {
  stats: SystemStats | null;
  onTabChange: (tab: string) => void;
}

export default function SuperAdminOverview({ stats, onTabChange }: SuperAdminOverviewProps) {
  const systemStats = stats || {
    total_users: 0,
    total_admins: 0,
    total_financial_admins: 0,
    total_user_admins: 0,
    pending_approvals: 0,
    total_revenue: 0,
    pending_payouts: 0,
    system_health: 'healthy',
    database_size: '0 GB',
    active_sessions: 0
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return XCircle;
      default: return CheckCircle;
    }
  };

  const HealthIcon = getHealthIcon(systemStats.system_health);

  const quickActions = [
    {
      title: "Manage Admins",
      description: "Configure admin roles and permissions",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      tab: "admin-management"
    },
    {
      title: "Financial Oversight",
      description: "Approve reports and manage payouts",
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      tab: "finance"
    },
    {
      title: "Role Configuration",
      description: "Set up user roles and access levels",
      icon: Key,
      color: "bg-purple-100 text-purple-600",
      tab: "role-config"
    },
    {
      title: "System Control",
      description: "Core system operations and maintenance",
      icon: Server,
      color: "bg-orange-100 text-orange-600",
      tab: "system"
    }
  ];

  return (
    <div className="space-y-6">
      {/* System Health Banner */}
      <Card className={`border-l-4 ${
        systemStats.system_health === 'healthy' ? 'border-l-green-500' :
        systemStats.system_health === 'warning' ? 'border-l-yellow-500' :
        'border-l-red-500'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${getHealthColor(systemStats.system_health)}`}>
                <HealthIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">System Status: {systemStats.system_health.toUpperCase()}</h3>
                <p className="text-gray-600">
                  {systemStats.system_health === 'healthy' 
                    ? 'All systems operational' 
                    : systemStats.system_health === 'warning'
                    ? 'Some systems require attention'
                    : 'Critical issues detected'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold">{systemStats.active_sessions}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Admins"
          value={systemStats.total_admins}
          description="Administrative users"
          icon={Shield}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Financial Admins"
          value={systemStats.total_financial_admins}
          description="Finance management"
          icon={DollarSign}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Pending Approvals"
          value={systemStats.pending_approvals}
          description="Awaiting action"
          icon={FileText}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
        <StatCard
          title="Database Size"
          value={systemStats.database_size}
          description="System data"
          icon={Database}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Summary
            </CardTitle>
            <CardDescription>Revenue and payout overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="text-lg font-bold text-green-600">
                ${systemStats.total_revenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Payouts</span>
              <span className="text-lg font-bold text-orange-600">
                ${systemStats.pending_payouts.toLocaleString()}
              </span>
            </div>
            <Button 
              className="w-full" 
              onClick={() => onTabChange('finance')}
            >
              Manage Finances
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
            <CardDescription>Administrative user overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">User Admins</span>
              <span className="text-lg font-bold">{systemStats.total_user_admins}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total System Users</span>
              <span className="text-lg font-bold">{systemStats.total_users}</span>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onTabChange('admin-management')}
            >
              Manage Admins
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onTabChange(action.tab)}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  color, 
  bgColor 
}: {
  title: string;
  value: number | string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className={`h-12 w-12 rounded-full ${bgColor} flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}