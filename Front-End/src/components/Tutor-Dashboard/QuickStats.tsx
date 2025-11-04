// components/tutor-dashboard/QuickStats.tsx
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, FileText, BarChart3 } from "lucide-react";

interface ClassItem {
  students: number;
  pendingSubmissions: number;
  avgGrade: number;
}

interface QuickStatsProps {
  classes: ClassItem[];
}

export default function QuickStats({ classes }: QuickStatsProps) {
  const totalStudents = classes.reduce((acc, cls) => acc + cls.students, 0);
  const totalPending = classes.reduce((acc, cls) => acc + cls.pendingSubmissions, 0);
  const averageGrade = Math.round(classes.reduce((acc, cls) => acc + cls.avgGrade, 0) / classes.length);

  const stats = [
    { 
      icon: BookOpen, 
      value: classes.length.toString(), 
      label: "Active Classes", 
      color: "blue" 
    },
    { 
      icon: Users, 
      value: totalStudents.toString(), 
      label: "Total Students", 
      color: "green" 
    },
    { 
      icon: FileText, 
      value: totalPending.toString(), 
      label: "Pending Reviews", 
      color: "orange" 
    },
    { 
      icon: BarChart3, 
      value: `${averageGrade}%`, 
      label: "Avg Grade", 
      color: "purple" 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any; 
  value: string; 
  label: string; 
  color: string; 
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600"
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}