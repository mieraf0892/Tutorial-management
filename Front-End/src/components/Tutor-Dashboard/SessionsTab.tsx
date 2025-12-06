// components/Tutor-Dashboard/SessionsTab.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plus,
  Edit,
  Trash2,
  PlayCircle
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import CreateSessionDialog from "./CreateSessionDialog";

interface TutorialSession {
  id: number;
  tutorial_id: number;
  tutorial_title: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "completed" | "cancelled";
  meeting_link: string | null;
  session_type: string;
  duration_minutes: number;
  student_count: number;
  attendance_marked: boolean;
}

interface Tutorial {
  id: number;
  title: string;
}

interface SessionsTabProps {
  sessions: TutorialSession[];
  onStartSession: (session: TutorialSession) => void;
  onMarkAttendance: (sessionId: number, attendanceData: any) => void;
}

export default function SessionsTab({ sessions, onStartSession, onMarkAttendance }: SessionsTabProps) {
  const [allSessions, setAllSessions] = useState<TutorialSession[]>(sessions);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const { toast } = useToast();

  // Fetch all sessions and tutorials
  const fetchSessionsAndTutorials = async () => {
    try {
      setLoading(true);
      
      // Fetch sessions
      const sessionsResponse = await apiClient.get('/tutor/sessions');
      if (sessionsResponse.data.success) {
        setAllSessions(sessionsResponse.data.sessions || []);
      }

      // Fetch tutorials for session creation
      const tutorialsResponse = await apiClient.get('/tutor/tutorials');
      if (tutorialsResponse.data.success) {
        setTutorials(tutorialsResponse.data.tutorials || []);
      }

    } catch (error: any) {
      console.error('Failed to fetch sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load sessions data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionsAndTutorials();
  }, []);

  // Filter sessions based on active tab
  const filteredSessions = allSessions.filter(session => {
    const now = new Date();
    const sessionTime = new Date(session.start_time);
    
    switch (activeTab) {
      case 'upcoming':
        return session.status === 'scheduled' && sessionTime > now;
      case 'completed':
        return session.status === 'completed';
      default:
        return true;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4 text-blue-600 dark:text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-600 dark:text-red-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
      case 'completed': return 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/30';
      case 'cancelled': return 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatSessionTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return {
      date: start.toLocaleDateString(),
      time: `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      isPast: start < new Date()
    };
  };

  const handleSessionCreated = () => {
    fetchSessionsAndTutorials();
    setShowCreateDialog(false);
  };

  // In SessionsTab.tsx - add this function
const handleMarkComplete = async (sessionId: number) => {
  try {
    const response = await apiClient.put(`/sessions/${sessionId}`, {
      status: 'completed'
    });
    
    if (response.data.success) {
      toast({
        title: "Success",
        description: "Session marked as completed",
      });
      fetchSessionsAndTutorials();
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: "Failed to update session status",
      variant: "destructive",
    });
  }
};

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const response = await apiClient.delete(`/sessions/${sessionId}`);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Session deleted successfully",
        });
        fetchSessionsAndTutorials();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tutorial Sessions</h2>
          <p className="text-muted-foreground">Manage your tutorial sessions and attendance</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Session
        </Button>
      </div>

      {/* Session Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Upcoming
            <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">
              {allSessions.filter(s => s.status === 'scheduled' && new Date(s.start_time) > new Date()).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed
            <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">
              {allSessions.filter(s => s.status === 'completed').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            All Sessions
            <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">
              {allSessions.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Sessions Content */}
        <TabsContent value={activeTab} className="space-y-6">
          {filteredSessions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSessions.map((session) => {
                const { date, time, isPast } = formatSessionTime(session.start_time, session.end_time);
                const canStartSession = session.status === 'scheduled' && session.meeting_link;
                const canMarkComplete = session.status === 'scheduled' && isPast;
                
                return (
                  <Card key={session.id} className="hover:shadow-lg transition-shadow bg-card border-border">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-foreground">{session.title}</CardTitle>
                          <CardDescription>{session.tutorial_title}</CardDescription>
                        </div>
                        <Badge className={`border ${getStatusColor(session.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(session.status)}
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </div>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Session Details */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{time}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>{session.student_count} students</span>
                            </div>
                          </div>
                          
                          {session.description && (
                            <p className="text-muted-foreground text-xs line-clamp-2">
                              {session.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Type: {session.session_type}</span>
                            <span>{session.duration_minutes} minutes</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 flex-wrap">
                          {/* Start Session */}
                          {canStartSession && (
                            <Button size="sm" onClick={() => onStartSession(session)}>
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Start Session
                            </Button>
                          )}

                          {/* Mark Complete */}
                          {canMarkComplete && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleMarkComplete(session.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Complete
                            </Button>
                          )}

                          {/* Mark Attendance */}
                          {session.status === 'completed' && !session.attendance_marked && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onMarkAttendance(session.id, {})}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Attendance
                            </Button>
                          )}

                          {/* Attendance Status */}
                          {session.attendance_marked && (
                            <Badge variant="secondary" className="bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Attendance Marked
                            </Badge>
                          )}

                          {/* Session Actions */}
                          {session.status === 'scheduled' && (
                            <div className="flex gap-1 ml-auto">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/20"
                                onClick={() => handleDeleteSession(session.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-12 bg-card border-border">
              <CardContent>
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {activeTab === 'upcoming' ? 'No upcoming sessions' : 
                   activeTab === 'completed' ? 'No completed sessions' : 'No sessions found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'upcoming' ? 'Create a session to get started' : 
                   'Sessions will appear here as they are created and completed'}
                </p>
                {activeTab === 'upcoming' && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Session
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Session Dialog - Only render if tutorials are loaded */}
      {showCreateDialog && (
        <CreateSessionDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSessionCreated={handleSessionCreated}
          tutorials={tutorials}
        />
      )}
    </div>
  );
}