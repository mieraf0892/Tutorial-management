// components/tutor-dashboard/StudentsTab.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MessageSquare, MoreVertical, Download } from "lucide-react";

interface Student {
  id: number;
  name: string;
  email: string;
  class: string;
  submissions: number;
  avgGrade: number;
  pending: number;
  trend: 'up' | 'down';
}

interface StudentsTabProps {
  students: Student[];
}

export default function StudentsTab({ students }: StudentsTabProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Student Performance</CardTitle>
            <CardDescription>Monitor student progress and engagement</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Grades
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.map((student) => (
            <StudentItem key={student.id} student={student} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StudentItem({ student }: { student: Student }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white">
            {student.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{student.name}</h3>
            <Badge variant="outline" className="text-xs">
              {student.trend === 'up' ? '📈 Improving' : '📉 Needs Help'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{student.email}</p>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <span>{student.submissions} submissions</span>
            <span>Avg Grade: {student.avgGrade}%</span>
            {student.pending > 0 && (
              <span className="text-red-500">{student.pending} pending</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          Message
        </Button>
        <StudentDropdownMenu />
      </div>
    </div>
  );
}

function StudentDropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>View Profile</DropdownMenuItem>
        <DropdownMenuItem>Grade History</DropdownMenuItem>
        <DropdownMenuItem>Send Feedback</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}