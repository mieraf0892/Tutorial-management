// components/Student-Dashboard/QuickStats.tsx
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, CheckCircle, Clock, Users } from "lucide-react";

interface Stats {
  total_enrolled: number;
  completed_tutorials: number;
  in_progress_tutorials: number;
  total_lessons_completed: number;
}

interface QuickStatsProps {
  stats?: Stats | null; // allow undefined/null
}

export default function QuickStats({ stats }: QuickStatsProps) {
  // 🔒 Guard: handle missing or loading stats safely
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-3">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const {
    total_enrolled,
    completed_tutorials,
    in_progress_tutorials,
    total_lessons_completed,
  } = stats;

  const statCards = [
    {
      title: "Enrolled Tutorials",
      value: total_enrolled,
      icon: BookOpen,
      description: "Total courses you're taking",
      color: "primary",
    },
    {
      title: "In Progress",
      value: in_progress_tutorials,
      icon: Clock,
      description: "Courses you're currently learning",
      color: "warning",
    },
    {
      title: "Completed",
      value: completed_tutorials,
      icon: CheckCircle,
      description: "Courses you've finished",
      color: "success",
    },
    {
      title: "Lessons Completed",
      value: total_lessons_completed,
      icon: Users,
      description: "Total lessons finished",
      color: "secondary",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      primary: "bg-primary/10 text-primary border-primary/20",
      warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20",
      success: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
      secondary: "bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20",
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
              <div
                className={`p-3 rounded-full border ${getColorClasses(stat.color)}`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>

            {/* Progress bar for enrolled vs completed */}
            {stat.title === "Enrolled Tutorials" && total_enrolled > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>
                    {Math.round(
                      (completed_tutorials / total_enrolled) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(completed_tutorials / total_enrolled) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}