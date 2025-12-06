// components/Tutor-Dashboard/TutorQuickStats.tsx
import { Users, BookOpen, Calendar, DollarSign, Star, Clock } from "lucide-react";

interface Stats {
  total_tutorials: number;
  total_students: number;
  upcoming_sessions: number;
  completed_sessions: number;
  total_earnings: number;
  average_rating: number;
}

interface TutorQuickStatsProps {
  stats: Stats;
}

export default function TutorQuickStats({ stats }: TutorQuickStatsProps) {
  const statCards = [
    {
      label: "Total Tutorials",
      value: stats.total_tutorials,
      icon: BookOpen,
      color: "primary"
    },
    {
      label: "Total Students",
      value: stats.total_students,
      icon: Users,
      color: "success"
    },
    {
      label: "Upcoming Sessions",
      value: stats.upcoming_sessions,
      icon: Calendar,
      color: "warning"
    },
    {
      label: "Completed Sessions",
      value: stats.completed_sessions,
      icon: Clock,
      color: "secondary"
    },
    {
      label: "Total Earnings",
      value: `$${stats.total_earnings}`,
      icon: DollarSign,
      color: "accent"
    },
    {
      label: "Average Rating",
      value: stats.average_rating.toFixed(1),
      icon: Star,
      color: "rating"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      primary: "bg-primary/10 text-primary",
      success: "bg-green-500/10 text-green-600 dark:text-green-500",
      warning: "bg-orange-500/10 text-orange-600 dark:text-orange-500",
      secondary: "bg-purple-500/10 text-purple-600 dark:text-purple-500",
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500",
      rating: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500"
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}