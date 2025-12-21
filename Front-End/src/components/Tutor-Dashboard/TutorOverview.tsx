import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  Clock, 
  DollarSign,
  ClipboardList,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

interface TutorOverviewProps {
  stats: any;
  students: any[];
  tutorials: any[];
  upcomingSessions: any[];
  recentPayments: any[];
  onCreateTutorial: () => void;
}

export default function TutorOverview({
  stats,
  students,
  tutorials,
  upcomingSessions,
  recentPayments,
  onCreateTutorial
}: TutorOverviewProps) {
  
  // Calculate stats for display
  const displayStats = [
    {
      label: "Total Tutorials",
      value: stats?.total_tutorials || 0,
      icon: BookOpen,
      color: "text-blue-600 bg-blue-100",
      description: "Created by you"
    },
    {
      label: "Assigned Tutorials",
      value: stats?.assigned_tutorials || 0,
      icon: ClipboardList,
      color: "text-purple-600 bg-purple-100",
      description: "From admin assignments"
    },
    {
      label: "Total Students",
      value: stats?.total_students || 0,
      icon: Users,
      color: "text-green-600 bg-green-100",
      description: "Across all tutorials"
    },
    {
      label: "Pending Assignments",
      value: stats?.pending_assignments || 0,
      icon: AlertCircle,
      color: "text-yellow-600 bg-yellow-100",
      description: "Need your response"
    }
  ];

  // Filter tutorials by status
  const publishedTutorials = tutorials?.filter(t => t.status === 'published') || [];
  const pendingTutorials = tutorials?.filter(t => t.status === 'pending_approval') || [];
  const draftTutorials = tutorials?.filter(t => t.status === 'draft') || [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tutorial Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Tutorial Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Published</span>
                </div>
                <Badge variant="outline">{publishedTutorials.length}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span>Pending Approval</span>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  {pendingTutorials.length}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-500" />
                  <span>Drafts</span>
                </div>
                <Badge variant="outline">{draftTutorials.length}</Badge>
              </div>
            </div>
            
            <Button 
              onClick={onCreateTutorial}
              className="w-full"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Create New Tutorial
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              New tutorials require admin approval before publishing
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 3).map((session) => (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{session.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.start_time).toLocaleDateString()} • 
                        {new Date(session.start_time).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {session.tutorial?.title || 'No Tutorial'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No upcoming sessions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium">Check Assignments</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Go to "My Assignments" to review and accept/reject tutorials assigned by admin.
              </p>
            </div>
            
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h4 className="font-medium">Create Content</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                After accepting an assignment, add lessons and materials to the tutorial.
              </p>
            </div>
            
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <h4 className="font-medium">Approval Required</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Tutorials you create need admin approval before they're published.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}