// components/Tutor-Dashboard/ScheduleTab.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Clock, Users, Video, MapPin } from "lucide-react";

interface TutorialSession {
  id: number;
  tutorial_id: number;
  tutorial_title: string;
  title: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "completed" | "cancelled";
  meeting_link: string | null;
  student_count: number;
}

interface ScheduleTabProps {
  sessions: TutorialSession[];
}

export default function ScheduleTab({ sessions }: ScheduleTabProps) {
  const [view, setView] = useState<"week" | "month" | "list">("week");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Group sessions by date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = new Date(session.start_time).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {} as Record<string, TutorialSession[]>);

  // Get upcoming sessions (next 7 days)
  const upcomingSessions = sessions
    .filter(session => new Date(session.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400';
      case 'completed': return 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-400';
    }
  };

  const getStatCardColor = (type: string) => {
    switch (type) {
      case "calendar": return "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400";
      case "clock": return "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400";
      case "users": return "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400";
      case "video": return "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400";
      default: return "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400";
    }
  };

  const formatSessionTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return {
      date: start.toLocaleDateString(),
      time: `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      isToday: start.toDateString() === new Date().toDateString()
    };
  };

  const handleCreateSession = () => {
    // In real app, this would open a session creation dialog
    console.log("Create new session");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Schedule Management</h2>
          <p className="text-muted-foreground">Manage your tutorial sessions and availability</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("week")}
            >
              Week
            </Button>
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("month")}
            >
              Month
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
            >
              List
            </Button>
          </div>
          <Button onClick={handleCreateSession}>
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold text-foreground">{sessions.length}</p>
              </div>
              <div className={`p-2 rounded-lg ${getStatCardColor("calendar")}`}>
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-foreground">{upcomingSessions.length}</p>
              </div>
              <div className={`p-2 rounded-lg ${getStatCardColor("clock")}`}>
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">
                  {sessions.filter(s => s.status === 'completed').length}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${getStatCardColor("users")}`}>
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold text-foreground">
                  {sessions.filter(s => s.status === 'cancelled').length}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${getStatCardColor("video")}`}>
                <Video className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Upcoming Sessions</CardTitle>
          <CardDescription>Your scheduled tutorial sessions for the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => {
                const { date, time, isToday } = formatSessionTime(session.start_time, session.end_time);
                
                return (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-center p-3 rounded-lg ${
                        isToday 
                          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <div className="text-sm font-semibold">
                          {new Date(session.start_time).toLocaleDateString('en', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {new Date(session.start_time).getDate()}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-foreground">{session.title}</h4>
                        <p className="text-sm text-muted-foreground">{session.tutorial_title}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {session.student_count} students
                          </div>
                          {session.meeting_link && (
                            <div className="flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              Online
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </Badge>
                      {session.meeting_link && (
                        <Button size="sm" variant="outline">
                          Join Session
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No upcoming sessions</h3>
              <p className="text-muted-foreground mb-4">Schedule your first tutorial session to get started</p>
              <Button onClick={handleCreateSession}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}