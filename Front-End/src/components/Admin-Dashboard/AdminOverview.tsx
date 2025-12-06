import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Users, BookOpen, BarChart3, ArrowUpRight, TrendingUp, 
  UserCheck, Shield, Settings, Activity,
  ClipboardCheck,
  Bell,
  FileText,
  // NEW IMPORTS:
  MessageCircle,
  ClipboardList,
  Wifi,
  CheckCircle2,
  AlertCircle,
  Circle
} from "lucide-react";

interface SystemStats {
  total_users: number;
  total_students: number;
  total_tutors: number;
  pending_verifications: number;
  pending_reports?: number;
  total_classes?: number;
  recent_attendance_count?: number;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  target?: string;
  time: string;
  type: string;
}

interface Metric {
  metric: string;
  value: number;
  target: number;
  trend: "up" | "down";
}

// ENHANCED PROPS INTERFACE - ADDED 2 NEW CALLBACKS
interface AdminOverviewProps {
  systemStats: SystemStats;
  recentActivities: any[];
  platformAnalytics: any;
  onUserManagement: () => void;
  onViewUsers: () => void;
  onViewClasses: () => void;
  onViewTutorOnboarding: () => void; 
  onViewReporting: () => void;
  // NEW CALLBACKS:
  onSendNotification: () => void;
  onViewAttendance: () => void;
}

// ENHANCED COMPONENT FUNCTION - ADDED 2 NEW PROPS
export default function AdminOverview({
  systemStats,
  recentActivities,
  onUserManagement,
  onViewUsers,
  onViewClasses,
  onViewTutorOnboarding,
  onViewReporting,
  // NEW PROPS:
  onSendNotification,
  onViewAttendance
}: AdminOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Quick Stats Grid - Enhanced from first version */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={systemStats.total_users}
          description="Across platform"
          icon={Users}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Students"
          value={systemStats.total_students}
          description="Active learners"
          icon={UserCheck}
          color="text-green-600 dark:text-green-400"
          bgColor="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title="Tutors"
          value={systemStats.total_tutors}
          description={`${systemStats.pending_verifications} pending`}
          icon={Shield}
          color="text-purple-600 dark:text-purple-400"
          bgColor="bg-purple-100 dark:bg-purple-900/30"
        />
        <StatCard
          title="Pending Verifications"
          value={systemStats.pending_verifications}
          description="Awaiting approval"
          icon={TrendingUp}
          color="text-orange-600 dark:text-orange-400"
          bgColor="bg-orange-100 dark:bg-orange-900/30"
        />
      </div>

      {/* Quick Actions - Enhanced with ALL 6 priority functions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. User Management */}
        <ActionCard
          title="Manage Users"
          description="Add new users or manage existing accounts"
          icon={Users}
          buttonText="Add User"
          buttonIcon={Plus}
          color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          buttonColor="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600"
          onClick={onUserManagement}
          highlight={true}
        />
        
        {/* 2. Tutor Onboarding */}
        <ActionCard
          title="Tutor Onboarding"
          description={`${systemStats.pending_verifications} pending applications`}
          icon={UserCheck}
          buttonText="Review"
          buttonIcon={ClipboardCheck}
          color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
          buttonColor="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600"
          onClick={onViewTutorOnboarding}
          highlight={systemStats.pending_verifications > 0}
        />
        
        {/* 3. Class Management */}
        <ActionCard
          title="Manage Classes"
          description="Create and monitor platform classes"
          icon={BookOpen}
          buttonText="View Classes"
          buttonIcon={BookOpen}
          color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          buttonColor="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          onClick={onViewClasses}
        />
        
        {/* 4. Session Reports */}
        <ActionCard
          title="Session Reports"
          description={`${systemStats.pending_reports || 0} pending approval`}
          icon={FileText}
          buttonText="Review"
          buttonIcon={ClipboardCheck}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          buttonColor="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          onClick={onViewReporting}
          highlight={(systemStats.pending_reports || 0) > 0}
        />
        
        {/* 5. Communication - NEW */}
        <ActionCard
          title="Send Notification"
          description="Broadcast messages to users"
          icon={MessageCircle}
          buttonText="Compose"
          buttonIcon={Bell}
          color="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
          buttonColor="bg-pink-600 hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-600"
          onClick={onSendNotification}
        />
        
        {/* 6. Attendance Tracking - NEW */}
        <ActionCard
          title="Track Attendance"
          description={`${systemStats.recent_attendance_count || 0} recent records`}
          icon={ClipboardList}
          buttonText="View"
          buttonIcon={ClipboardList}
          color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          buttonColor="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
          onClick={onViewAttendance}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="w-5 h-5" />
                  Recent Activities
                </CardTitle>
                <CardDescription>Latest platform activities and events</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={onViewUsers} className="bg-card hover:bg-accent">
                View All
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.slice(0, 5).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activities</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Analytics */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="w-5 h-5" />
              Platform Health
            </CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <MetricItem
                title="Active Classes"
                value={systemStats.total_classes || 0}
                description="Currently running"
                icon={BookOpen}
                color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              />
              <MetricItem
                title="Attendance Rate"
                value={85}
                description="Average across sessions"
                icon={Users}
                color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              />
              <MetricItem
                title="Platform Growth"
                value={15}
                description="This month"
                icon={TrendingUp}
                color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              />
              <MetricItem
                title="Pending Actions"
                value={systemStats.pending_verifications + (systemStats.pending_reports || 0)}
                description="Require attention"
                icon={Bell}
                color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
              />
            </div>
            
            {/* Quick Links */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium mb-3 text-foreground">Quick Access</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start bg-card hover:bg-accent border-border"
                  onClick={onViewTutorOnboarding}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Tutor Onboarding
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start bg-card hover:bg-accent border-border"
                  onClick={onViewReporting}
                >
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Session Reports
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start bg-card hover:bg-accent border-border"
                  onClick={onViewClasses}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Class Management
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// KEEP ALL YOUR EXISTING COMPONENT FUNCTIONS (StatCard, ActionCard, ActivityItem, etc.)
// They remain exactly the same - no changes needed

// Enhanced Stat Card Component
function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  color, 
  bgColor 
}: {
  title: string;
  value: number;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}) {
  return (
    <Card className="border border-border shadow-sm hover:shadow-md transition-shadow bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
        <div className={`h-8 w-8 rounded-full ${bgColor} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Enhanced Action Card Component
function ActionCard({
  title,
  description,
  icon: Icon,
  buttonText,
  buttonIcon: ButtonIcon,
  color,
  buttonColor,
  onClick,
  highlight = false
}: {
  title: string;
  description: string;
  icon: any;
  buttonText: string;
  buttonIcon: any;
  color: string;
  buttonColor: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <Card 
      className={`border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer group bg-card ${
        highlight ? 'dark:bg-linear-to-br dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
        <div className={`h-8 w-8 rounded-full ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
        <Button 
          size="sm" 
          className={`w-full gap-2 text-white ${buttonColor}`}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          <ButtonIcon className="h-4 w-4" />
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}

// Enhanced Activity Item Component
function ActivityItem({ activity }: { activity: Activity }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'class': return { icon: BookOpen, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' };
      case 'system': return { icon: Settings, color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' };
      case 'material': return { icon: BookOpen, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' };
      case 'user': return { icon: Users, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' };
      case 'student': return { icon: UserCheck, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' };
      case 'tutor': return { icon: Shield, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' };
      default: return { icon: Activity, color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' };
    }
  };

  const { icon: Icon, color } = getActivityIcon(activity.type);

  return (
    <div className="flex items-start justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors bg-card">
      <div className="flex items-center space-x-3">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium text-sm text-foreground">{activity.user}</p>
          <p className="text-xs text-muted-foreground">
            {activity.action} {activity.target && <span className="font-medium text-foreground">{activity.target}</span>}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">{activity.time}</p>
      </div>
    </div>
  );
}

// Enhanced Metric Progress Component
function MetricProgress({ metric }: { metric: Metric }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">{metric.metric}</span>
        <span className="text-sm font-bold text-foreground">
          {metric.value % 1 !== 0 ? metric.value.toFixed(1) : metric.value}%
        </span>
      </div>
      <Progress value={metric.value} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Target: {metric.target}%</span>
        <span className={metric.value >= metric.target ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
          {metric.value >= metric.target ? "Above target" : "Below target"}
        </span>
      </div>
    </div>
  );
}

// Simple Metric Item for fallback
function MetricItem({
  title,
  value,
  description,
  icon: Icon,
  color
}: {
  title: string;
  value: number;
  description: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`h-8 w-8 rounded-full ${color} flex items-center justify-center`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium text-sm text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}