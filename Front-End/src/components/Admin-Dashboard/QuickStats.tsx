// components/admin-dashboard/QuickStats.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, UserCheck, BookOpen, UserX, AlertCircle } from "lucide-react";

interface QuickStatsProps {
  stats: {
    total_users: number;
    total_students: number;
    total_tutors: number;
    pending_verifications: number;
    total_classes?: number;
    recent_attendance_count?: number;
    pending_reports?: number;
  };
}

export default function QuickStats({ stats }: QuickStatsProps) {
  // Transform the backend stats into the card format
  const statCards = [
    {
      label: "Total Users",
      value: stats.total_users.toLocaleString(),
      change: "+12%",
      trend: "up" as const,
      icon: Users,
      color: "blue" as const,
      description: "All registered users",
      format: "number" as const
    },
    {
      label: "Students",
      value: stats.total_students.toLocaleString(),
      change: "+8%",
      trend: "up" as const,
      icon: UserCheck,
      color: "green" as const,
      description: "Active learning accounts",
      format: "number" as const
    },
    {
      label: "Tutors",
      value: stats.total_tutors.toLocaleString(),
      change: "+15%",
      trend: "up" as const,
      icon: BookOpen,
      color: "purple" as const,
      description: "Verified teaching staff",
      format: "number" as const
    },
    {
      label: "Pending Verifications",
      value: stats.pending_verifications.toString(),
      change: stats.pending_verifications > 0 ? "+5%" : "-5%",
      trend: stats.pending_verifications > 0 ? "up" as const : "down" as const,
      icon: UserX,
      color: "orange" as const,
      description: "Tutors awaiting approval",
      format: "number" as const,
      alert: stats.pending_verifications > 0
    },
    ...(stats.total_classes ? [{
      label: "Active Classes",
      value: stats.total_classes.toString(),
      change: "+3%",
      trend: "up" as const,
      icon: BookOpen,
      color: "indigo" as const,
      description: "Currently running courses",
      format: "number" as const
    }] : []),
    ...(stats.recent_attendance_count ? [{
      label: "Recent Attendance",
      value: stats.recent_attendance_count.toString(),
      change: "+7%",
      trend: "up" as const,
      icon: Users,
      color: "teal" as const,
      description: "Sessions this week",
      format: "number" as const
    }] : []),
    ...(stats.pending_reports ? [{
      label: "Pending Reports",
      value: stats.pending_reports.toString(),
      change: "+2%",
      trend: "up" as const,
      icon: AlertCircle,
      color: "red" as const,
      description: "Reports awaiting review",
      format: "number" as const,
      alert: stats.pending_reports > 0
    }] : [])
  ];

  // Determine grid columns based on number of cards
  const gridCols = statCards.length <= 4 
    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" 
    : statCards.length <= 6
    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-4 md:gap-6`}>
      {statCards.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  );
}

function StatCard({ stat }: { stat: any }) {
  const Icon = stat.icon;
  
  const colorClasses = {
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800"
    },
    green: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-800"
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800"
    },
    orange: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-800"
    },
    indigo: {
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-200 dark:border-indigo-800"
    },
    teal: {
      bg: "bg-teal-100 dark:bg-teal-900/30",
      text: "text-teal-600 dark:text-teal-400",
      border: "border-teal-200 dark:border-teal-800"
    },
    red: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-800"
    }
  };

  const colors = colorClasses[stat.color] || colorClasses.blue;

  return (
    <Card className={`border border-border shadow-sm hover:shadow-md transition-all duration-200 bg-card group hover:scale-[1.02] ${
      stat.alert ? 'ring-2 ring-orange-200 dark:ring-orange-800' : ''
    }`}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-muted-foreground truncate">{stat.label}</p>
              {stat.alert && (
                <Badge variant="destructive" className="h-4 px-1 text-xs">
                  !
                </Badge>
              )}
            </div>
            
            <p className="text-2xl md:text-3xl font-bold text-foreground truncate">
              {stat.value}
            </p>
            
            <div className={`flex items-center mt-2 text-xs ${
              stat.trend === "up" 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            }`}>
              {stat.trend === "up" ? (
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1 shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 md:w-4 md:h-4 mr-1 shrink-0" />
              )}
              <span className="truncate">{stat.change} from last month</span>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {stat.description}
            </p>
          </div>
          
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0 ml-3 group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </div>

        {/* Progress indicator for alerts */}
        {stat.alert && (
          <div className="mt-3 w-full bg-muted rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all duration-1000 ${
                stat.color === 'orange' ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ 
                width: `${Math.min((parseInt(stat.value) / 10) * 100, 100)}%` 
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}