// components/Student-Dashboard/AttendanceRecords.tsx
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, TrendingUp, BookOpen, Users } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AttendanceRecord {
  id: number;
  tutorial_id: number;
  tutorial_title: string;
  tutorial_session_id?: number;
  session_title?: string;
  session_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  duration_minutes: number;
  instructor_notes?: string;
  session_type?: string;
}

interface TutorialAttendance {
  tutorial_id: number;
  tutorial_title: string;
  instructor: string;
  total_sessions: number;
  attended_sessions: number;
  attendance_rate: number;
  late_sessions: number;
  absent_sessions: number;
  learning_hours?: number;
  enrollment_date?: string;
}

interface AttendanceStats {
  total_sessions: number;
  present_sessions: number;
  attendance_rate: number;
  late_sessions: number;
  absent_sessions: number;
  excused_sessions?: number;
  total_learning_hours?: number;
}

interface AttendanceSummary {
  overall: {
    total_tutorials: number;
    total_sessions: number;
    attended_sessions: number;
    attendance_rate: number;
    total_learning_hours: number;
  };
  tutorials: TutorialAttendance[];
  monthly_trend: Array<{
    month: string;
    month_name: string;
    total_sessions: number;
    attended_sessions: number;
    attendance_rate: number;
  }>;
  status_distribution: {
    present: number;
    late: number;
    absent: number;
    excused: number;
  };
}

interface AttendanceRecordsProps {
  tutorials: EnrolledTutorial[];
  stats: Stats;
  scheduledSessions: ScheduledSession[];
}

export default function AttendanceRecords({ tutorials, stats, scheduledSessions }: AttendanceRecordsProps) {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [tutorialAttendance, setTutorialAttendance] = useState<TutorialAttendance[]>([]);
  const [selectedTutorial, setSelectedTutorial] = useState<number | null>(null);
  const [tutorialDetail, setTutorialDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'tutorials' | 'detailed'>('overview');
  const { toast } = useToast();

  // Fetch attendance data for all enrolled tutorials
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch overall attendance summary
      const summaryResponse = await apiClient.get('/student/attendance/summary');
      if (summaryResponse.data.success) {
        setAttendanceSummary(summaryResponse.data.summary);
        setTutorialAttendance(summaryResponse.data.summary.tutorials || []);
      }

      // Fetch detailed attendance records
      const attendanceResponse = await apiClient.get('/student/attendance');
      if (attendanceResponse.data.success) {
        setAttendanceData(attendanceResponse.data.attendance.records || []);
      }

    } catch (error: any) {
      console.error('Failed to fetch attendance data:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed attendance for a specific tutorial
  const fetchTutorialAttendance = async (tutorialId: number) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/student/tutorials/${tutorialId}/attendance`);
      if (response.data.success) {
        setTutorialDetail(response.data.attendance);
        setSelectedTutorial(tutorialId);
      }
    } catch (error: any) {
      console.error('Failed to fetch tutorial attendance:', error);
      toast({
        title: "Error",
        description: "Failed to load tutorial attendance details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'excused':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/30';
      case 'absent':
        return 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30';
      case 'late':
        return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30';
      case 'excused':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const calculateAttendanceStats = (): AttendanceStats => {
    if (attendanceSummary?.overall) {
      return {
        total_sessions: attendanceSummary.overall.total_sessions,
        present_sessions: attendanceData.filter(a => a.status === 'present').length,
        attendance_rate: attendanceSummary.overall.attendance_rate,
        late_sessions: attendanceData.filter(a => a.status === 'late').length,
        absent_sessions: attendanceSummary.overall.total_sessions - attendanceSummary.overall.attended_sessions,
        excused_sessions: attendanceData.filter(a => a.status === 'excused').length,
        total_learning_hours: attendanceSummary.overall.total_learning_hours,
      };
    }

    // Fallback calculation
    const totalSessions = attendanceData.length;
    const presentSessions = attendanceData.filter(a => a.status === 'present').length;
    const lateSessions = attendanceData.filter(a => a.status === 'late').length;
    const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;
    
    return {
      total_sessions: totalSessions,
      present_sessions: presentSessions,
      attendance_rate: Math.round(attendanceRate),
      late_sessions: lateSessions,
      absent_sessions: attendanceData.filter(a => a.status === 'absent').length,
    };
  };

  const statsData = calculateAttendanceStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  // If viewing specific tutorial details
  if (selectedTutorial && tutorialDetail) {
    const tutorial = tutorials.find(t => t.id === selectedTutorial);
    return (
      <div className="space-y-6">
        {/* Back button and header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedTutorial(null);
              setTutorialDetail(null);
            }}
            className="flex items-center gap-2"
          >
            ← Back to All Tutorials
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{tutorialDetail.tutorial?.title}</h2>
            <p className="text-muted-foreground">Instructor: {tutorialDetail.tutorial?.instructor}</p>
          </div>
        </div>

        {/* Tutorial-specific stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold text-foreground">{tutorialDetail.stats?.attendance_rate || 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions Attended</p>
                <p className="text-2xl font-bold text-foreground">{tutorialDetail.stats?.attended_sessions || 0}</p>
                <p className="text-xs text-muted-foreground">of {tutorialDetail.stats?.total_sessions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Late Arrivals</p>
                <p className="text-2xl font-bold text-foreground">{tutorialDetail.stats?.late_sessions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Learning Hours</p>
                <p className="text-2xl font-bold text-foreground">{tutorialDetail.stats?.total_learning_hours || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Session-by-session attendance */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Session Attendance</h3>
            <p className="text-muted-foreground">Detailed attendance for each session in this tutorial</p>
          </div>
          <div className="p-6">
            {tutorialDetail.session_attendance && tutorialDetail.session_attendance.length > 0 ? (
              <div className="space-y-4">
                {tutorialDetail.session_attendance.map((session: any) => (
                  <div key={session.session_id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{session.session_title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.session_date).toLocaleDateString()} • 
                          {session.session_end_time && ` ${new Date(session.session_end_time).toLocaleTimeString()}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(session.status)}
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(session.status)}`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    {session.duration_minutes > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Duration: {session.duration_minutes} minutes
                      </p>
                    )}
                    
                    {session.instructor_notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong className="text-foreground">Instructor Notes:</strong> {session.instructor_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No sessions yet</h3>
                <p className="text-muted-foreground">Attendance records will appear here after sessions are completed.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main attendance view (all tutorials)
  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tutorials">By Tutorial</TabsTrigger>
          <TabsTrigger value="detailed">Detailed History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overall Attendance</p>
                  <p className="text-2xl font-bold text-foreground">{statsData.attendance_rate}%</p>
                  <p className="text-xs text-muted-foreground">
                    {statsData.present_sessions + statsData.late_sessions}/{statsData.total_sessions} sessions
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Tutorials</p>
                  <p className="text-2xl font-bold text-foreground">{attendanceSummary?.overall.total_tutorials || 0}</p>
                  <p className="text-xs text-muted-foreground">Enrolled courses</p>
                </div>
              </div>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Learning Hours</p>
                  <p className="text-2xl font-bold text-foreground">{statsData.total_learning_hours || 0}</p>
                  <p className="text-xs text-muted-foreground">Total time spent</p>
                </div>
              </div>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {tutorials.length > 0 
                      ? Math.round((tutorials.filter(t => t.is_completed).length / tutorials.length) * 100)
                      : 0
                    }%
                  </p>
                  <p className="text-xs text-muted-foreground">Tutorials completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trend */}
          {attendanceSummary?.monthly_trend && attendanceSummary.monthly_trend.length > 0 && (
            <div className="bg-card rounded-lg border border-border">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Monthly Attendance Trend</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {attendanceSummary.monthly_trend.map((month) => (
                    <div key={month.month} className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">{month.month_name}</p>
                      <p className="text-2xl font-bold text-primary">{month.attendance_rate}%</p>
                      <p className="text-xs text-muted-foreground">
                        {month.attended_sessions}/{month.total_sessions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tutorials Tab */}
        <TabsContent value="tutorials" className="space-y-6">
          <div className="bg-card rounded-lg border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Tutorial-wise Attendance</h3>
              <p className="text-muted-foreground">Click on a tutorial to view detailed attendance</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {tutorialAttendance.map((tutorial) => (
                  <div 
                    key={tutorial.tutorial_id} 
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-card"
                    onClick={() => fetchTutorialAttendance(tutorial.tutorial_id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-foreground">{tutorial.tutorial_title}</h4>
                        <p className="text-sm text-muted-foreground">Instructor: {tutorial.instructor}</p>
                        {tutorial.enrollment_date && (
                          <p className="text-xs text-muted-foreground">
                            Enrolled: {new Date(tutorial.enrollment_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{tutorial.attendance_rate}%</p>
                        <p className="text-sm text-muted-foreground">
                          {tutorial.attended_sessions}/{tutorial.total_sessions} sessions
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-muted rounded-full h-3 mb-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all duration-300"
                        style={{ width: `${tutorial.attendance_rate}%` }}
                      ></div>
                    </div>

                    {/* Quick stats */}
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-foreground">{tutorial.attended_sessions - tutorial.late_sessions} on time</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-foreground">{tutorial.late_sessions} late</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-foreground">{tutorial.absent_sessions} absent</span>
                      </div>
                      {tutorial.learning_hours && (
                        <div className="flex items-center gap-1 ml-auto">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="text-foreground">{tutorial.learning_hours}h learning</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Detailed History Tab */}
        <TabsContent value="detailed">
          <div className="bg-card rounded-lg border border-border">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Detailed Attendance History</h3>
              <div className="text-sm text-muted-foreground">
                {attendanceData.length} records found
              </div>
            </div>
            <div className="p-6">
              {attendanceData.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium text-foreground">No attendance records</h3>
                  <p className="mt-2 text-muted-foreground">Your attendance will appear here after sessions.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 font-medium text-foreground">Date & Time</th>
                        <th className="text-left py-3 font-medium text-foreground">Tutorial</th>
                        <th className="text-left py-3 font-medium text-foreground">Session</th>
                        <th className="text-left py-3 font-medium text-foreground">Status</th>
                        <th className="text-left py-3 font-medium text-foreground">Duration</th>
                        <th className="text-left py-3 font-medium text-foreground">Instructor Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData
                        .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime())
                        .map((record) => (
                          <tr key={record.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="py-3">
                              <div className="font-medium text-foreground">
                                {new Date(record.session_date).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(record.session_date).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="py-3">
                              <p className="font-medium text-foreground">{record.tutorial_title}</p>
                            </td>
                            <td className="py-3">
                              <p className="text-sm text-muted-foreground">
                                {record.session_title || 'Regular Session'}
                              </p>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(record.status)}
                                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(record.status)}`}>
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-foreground">
                              {record.duration_minutes > 0 ? `${record.duration_minutes} min` : '-'}
                            </td>
                            <td className="py-3">
                              <p className="text-sm text-muted-foreground max-w-xs">
                                {record.instructor_notes || 'No notes provided'}
                              </p>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}