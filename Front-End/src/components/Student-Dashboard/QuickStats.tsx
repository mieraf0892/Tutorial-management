// components/student-dashboard/QuickStats.tsx
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle2, BookOpen, Star } from "lucide-react";

const stats = [
  { icon: FileText, value: "5", label: "Due Soon", color: "blue" },
  { icon: CheckCircle2, value: "22", label: "Completed", color: "green" },
  { icon: BookOpen, value: "3", label: "Classes", color: "purple" },
  { icon: Star, value: "91%", label: "Average Grade", color: "orange" }
];

export default function QuickStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }: { 
  icon: any; 
  value: string; 
  label: string; 
  color: string; 
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600"
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