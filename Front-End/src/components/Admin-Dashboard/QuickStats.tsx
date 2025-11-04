// components/admin-dashboard/QuickStats.tsx
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, UserCheck, BookOpen, UserX } from "lucide-react";

interface QuickStatsProps {
  stats: {
    total_users: number;
    total_students: number;
    total_tutors: number;
    pending_verifications: number;
  };
}

export default function QuickStats({ stats }: QuickStatsProps) {
  // Transform the backend stats into the card format
  const statCards = [
    {
      label: "Total Users",
      value: stats.total_users.toString(),
      change: "+12%",
      trend: "up" as const,
      icon: Users,
      color: "blue" as const,
      description: "All registered users"
    },
    {
      label: "Students",
      value: stats.total_students.toString(),
      change: "+8%",
      trend: "up" as const,
      icon: UserCheck,
      color: "green" as const,
      description: "Registered students"
    },
    {
      label: "Tutors",
      value: stats.total_tutors.toString(),
      change: "+15%",
      trend: "up" as const,
      icon: BookOpen,
      color: "purple" as const,
      description: "Registered tutors"
    },
    {
      label: "Pending Verifications",
      value: stats.pending_verifications.toString(),
      change: "-5%",
      trend: "down" as const,
      icon: UserX,
      color: "orange" as const,
      description: "Tutors awaiting approval"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  );
}

function StatCard({ stat }: { stat: any }) {
  const Icon = stat.icon;
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600"
  };

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <div className={`flex items-center mt-1 text-sm ${
              stat.trend === "up" ? "text-green-600" : "text-red-600"
            }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {stat.change} from last month
            </div>
            <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl ${colorClasses[stat.color]} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}