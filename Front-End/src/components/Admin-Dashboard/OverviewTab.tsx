// components/admin-dashboard/OverviewTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, BarChart3, Users, BookOpen, Settings, Plus } from "lucide-react";
import QuickStats from "@/components/Admin-Dashboard/QuickStats";

interface SystemStats {
  total_users: number;
  total_students: number;
  total_tutors: number;
  pending_verifications: number;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  type: string;
}

interface Metric {
  metric: string;
  value: number;
  target: number;
  trend: "up" | "down";
}

interface OverviewTabProps {
  systemStats: SystemStats; // CHANGED: from array to object
  recentActivities: Activity[];
  platformAnalytics: Metric[];
  onUserManagement: () => void;
}

export default function OverviewTab({ 
  systemStats, 
  recentActivities, 
  platformAnalytics, 
  onUserManagement 
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Pass the object directly to QuickStats */}
      <QuickStats stats={systemStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivities activities={recentActivities} />
        <PlatformHealth analytics={platformAnalytics} />
      </div>

      <QuickActions onUserManagement={onUserManagement} />
    </div>
  );
}

// The rest of your component remains exactly the same...
function RecentActivities({ activities }: { activities: Activity[] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'class': return { icon: BookOpen, color: 'bg-blue-100 text-blue-600' };
      case 'system': return { icon: Clock, color: 'bg-gray-100 text-gray-600' };
      case 'material': return { icon: BookOpen, color: 'bg-green-100 text-green-600' };
      case 'user': return { icon: Users, color: 'bg-purple-100 text-purple-600' };
      default: return { icon: Clock, color: 'bg-gray-100 text-gray-600' };
    }
  };

  return (
    <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activities
        </CardTitle>
        <CardDescription>Latest platform activities and events</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const { icon: Icon, color } = getActivityIcon(activity.type);
          return (
            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span> {activity.action} 
                  <span className="font-medium"> {activity.target}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function PlatformHealth({ analytics }: { analytics: Metric[] }) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Platform Health
        </CardTitle>
        <CardDescription>Key performance indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {analytics.map((metric, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">{metric.metric}</span>
              <span className="text-sm font-bold text-gray-900">
                {metric.value % 1 !== 0 ? metric.value.toFixed(1) : metric.value}%
              </span>
            </div>
            <Progress value={metric.value} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Target: {metric.target}%</span>
              <span className={metric.value >= metric.target ? "text-green-600" : "text-red-600"}>
                {metric.value >= metric.target ? "Above target" : "Below target"}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function QuickActions({ onUserManagement }: { onUserManagement: () => void }) {
  const actions = [
    {
      title: "User Management",
      description: "Manage all users and permissions",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      onClick: onUserManagement,
      buttonText: "Manage Users",
      buttonIcon: Plus
    },
    {
      title: "Class Management",
      description: "Oversee all classes and content",
      icon: BookOpen,
      color: "bg-green-100 text-green-600",
      onClick: () => {},
      buttonText: "View All Classes",
      buttonIcon: BookOpen
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: Settings,
      color: "bg-purple-100 text-purple-600",
      onClick: () => {},
      buttonText: "Settings",
      buttonIcon: Settings
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <ActionCard key={index} action={action} />
        ))}
      </div>
    </div>
  );
}

function ActionCard({ action }: { 
  action: {
    title: string;
    description: string;
    icon: any;
    color: string;
    onClick: () => void;
    buttonText: string;
    buttonIcon: any;
  }
}) {
  const Icon = action.icon;
  const ButtonIcon = action.buttonIcon;

  return (
    <Card 
      className="border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
      onClick={action.onClick}
    >
      <CardHeader>
        <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <CardTitle>{action.title}</CardTitle>
        <CardDescription>{action.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          className="w-full gap-2" 
          onClick={(e) => { e.stopPropagation(); action.onClick(); }}
        >
          <ButtonIcon className="w-4 h-4" />
          {action.buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}