// components/student-dashboard/StreamTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Upload, Eye, MessageSquare, PlayCircle, FileText, Bell, BookOpen, Calendar, Star } from "lucide-react";

interface StreamItem {
  id: number;
  type: 'assignment' | 'announcement' | 'material';
  title: string;
  class: string;
  teacher: string;
  dueDate?: string;
  posted?: string;
  points?: number;
  status?: string;
  submitted?: boolean;
  grade?: number | null;
  description: string;
  attachments: number;
  comments: number;
}

interface Assignment {
  id: number;
  title: string;
  class: string;
  dueDate: string;
  dueTime: string;
  points: number;
  status: string;
  submitted: boolean;
}

interface StreamTabProps {
  streamItems: StreamItem[];
  upcomingAssignments: Assignment[];
}

export default function StreamTab({ streamItems, upcomingAssignments }: StreamTabProps) {
  return (
    <div className="space-y-6">
      {/* Upcoming Assignments */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-orange-500" />
            Upcoming Assignments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {upcomingAssignments.map((assignment) => (
              <UpcomingAssignment key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stream Items */}
      <div className="space-y-4">
        {streamItems.map((item) => (
          <StreamItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function UpcomingAssignment({ assignment }: { assignment: Assignment }) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            assignment.status === 'due-soon' ? 'bg-red-500' :
            assignment.status === 'due-tomorrow' ? 'bg-orange-500' : 'bg-blue-500'
          }`} />
          <div>
            <h4 className="font-medium text-gray-900">{assignment.title}</h4>
            <p className="text-sm text-gray-600">
              {assignment.class} • Due {assignment.dueDate} at {assignment.dueTime}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50">
            {assignment.points} pts
          </Badge>
          {!assignment.submitted && (
            <Button size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StreamItemCard({ item }: { item: StreamItem }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment': return FileText;
      case 'announcement': return Bell;
      case 'material': return BookOpen;
      default: return FileText;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'bg-blue-100 text-blue-600';
      case 'announcement': return 'bg-green-100 text-green-600';
      case 'material': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const Icon = getIcon(item.type);

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(item.type)}`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {item.class} • {item.teacher}
                </p>
              </div>
              {item.type === 'assignment' && (
                <Badge variant={
                  item.status === 'graded' ? 'default' :
                  item.status === 'assigned' ? 'secondary' : 'outline'
                } className="flex items-center gap-1">
                  {item.status === 'graded' ? `Graded: ${item.grade}/${item.points}` : 'Assigned'}
                </Badge>
              )}
            </div>

            <p className="text-gray-700 mt-2">{item.description}</p>

            <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
              {item.type === 'assignment' && (
                <>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Due {item.dueDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {item.points} points
                  </span>
                </>
              )}
              {item.type !== 'assignment' && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {item.posted}
                </span>
              )}
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {item.attachments} attachment{item.attachments !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-4">
              {item.type === 'assignment' && !item.submitted && (
                <Button size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Assignment
                </Button>
              )}
              {item.type === 'assignment' && item.submitted && (
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Submission
                </Button>
              )}
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Comment
              </Button>
              {item.type === 'material' && (
                <Button variant="outline" size="sm">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  View Material
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}