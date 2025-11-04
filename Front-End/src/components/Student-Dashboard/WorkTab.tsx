// components/student-dashboard/WorkTab.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Assignment {
  id: number;
  title: string;
  class: string;
  dueDate: string;
  status: string;
  submitted: boolean;
}

interface PerformanceData {
  class: string;
  grade: number;
  average: number;
  assignments: number;
  completed: number;
}

interface WorkTabProps {
  upcomingAssignments: Assignment[];
  performanceData: PerformanceData[];
}

export default function WorkTab({ upcomingAssignments, performanceData }: WorkTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* To-do List */}
      <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>To-do</CardTitle>
          <CardDescription>Your upcoming assignments and tasks</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {upcomingAssignments.map((assignment) => (
              <TodoItem key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Performance</CardTitle>
          <CardDescription>Your current grades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.map((item, index) => (
              <PerformanceItem key={index} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TodoItem({ assignment }: { assignment: Assignment }) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-gray-300 rounded-sm hover:border-gray-400 cursor-pointer" />
          <div>
            <h4 className="font-medium text-gray-900">{assignment.title}</h4>
            <p className="text-sm text-gray-600">
              {assignment.class} • Due {assignment.dueDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={
            assignment.status === 'due-soon' ? 'destructive' :
            assignment.status === 'due-tomorrow' ? 'secondary' : 'outline'
          }>
            {assignment.status === 'due-soon' ? 'Due Soon' :
              assignment.status === 'due-tomorrow' ? 'Tomorrow' : 'Upcoming'}
          </Badge>
          <Button size="sm">
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}

function PerformanceItem({ item }: { item: PerformanceData }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{item.class}</span>
        <span className="font-bold">{item.grade}%</span>
      </div>
      <Progress value={item.grade} className="h-2" />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{item.completed}/{item.assignments} assignments</span>
        <span>Class avg: {item.average}%</span>
      </div>
    </div>
  );
}