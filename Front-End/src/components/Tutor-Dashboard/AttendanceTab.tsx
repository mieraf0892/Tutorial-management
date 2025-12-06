// components/Tutor-Dashboard/AttendanceTab.tsx
import { useState} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  Users, 
  Search, 
  Download,
  BarChart3,
  FileText,
  ArrowLeft
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface TutorialSession {
  id: number;
  tutorial_id: number;
  tutorial_title: string;
  title: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "completed" | "cancelled";
  student_count: number;
  attendance_marked: boolean;
}

interface Student {
  id: number;
  name: string;
  email: string;
}

interface StudentAttendance {
  student_id: number;
  student_name: string;
  student_email: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
  attendance_id?: number;
  marked_at?: string;
}

interface SessionAttendance {
  session: TutorialSession;
  attendance: StudentAttendance[];
}

interface AttendanceTabProps {
  sessions: TutorialSession[];
  onMarkAttendance: (sessionId: number, attendanceData: any) => void;
}

export default function AttendanceTab({ sessions, onMarkAttendance }: AttendanceTabProps) {
  const [selectedSession, setSelectedSession] = useState<TutorialSession | null>(null);
  const [sessionAttendance, setSessionAttendance] = useState<SessionAttendance | null>(null);
  const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<'mark' | 'view' | 'reports'>('mark');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Filter sessions
  const sessionsNeedingAttendance = sessions.filter(
    session => session.status === 'completed' && !session.attendance_marked
  );

  const completedSessionsWithAttendance = sessions.filter(
    session => session.status === 'completed' && session.attendance_marked
  );

  // Fetch session attendance details
  const fetchSessionAttendance = async (sessionId: number) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/tutor/attendance/${sessionId}`);
      if (response.data.success) {
        setSessionAttendance({
          session: selectedSession!,
          attendance: response.data.attendance
        });
        setAttendanceData(response.data.attendance);
      }
    } catch (error: any) {
      console.error('Failed to fetch session attendance:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle session selection
  const handleSelectSession = (session: TutorialSession, view: 'mark' | 'view' = 'mark') => {
    setSelectedSession(session);
    setActiveView(view);
    if (view === 'view' || session.attendance_marked) {
      fetchSessionAttendance(session.id);
    } else {
      // Initialize with default present status for all enrolled students
      fetchEnrolledStudents(session.tutorial_id);
    }
  };

  // Fetch enrolled students for a tutorial
  const fetchEnrolledStudents = async (tutorialId: number) => {
    try {
      const response = await apiClient.get(`/tutor/tutorials/${tutorialId}/students`);
      if (response.data.success) {
        const students = response.data.students || [];
        const defaultAttendance: StudentAttendance[] = students.map((student: any) => ({
          student_id: student.id,
          student_name: student.name,
          student_email: student.email,
          status: 'present', // Default to present
          notes: ''
        }));
        setAttendanceData(defaultAttendance);
      }
    } catch (error: any) {
      console.error('Failed to fetch enrolled students:', error);
      toast({
        title: "Error",
        description: "Failed to load student list",
        variant: "destructive",
      });
    }
  };

  // Handle bulk attendance marking
  const handleBulkMarkAttendance = async () => {
    if (!selectedSession) return;

    try {
      setLoading(true);
      const response = await apiClient.post(
        `/tutor/sessions/${selectedSession.id}/attendance/bulk`,
        { attendance: attendanceData }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Attendance marked successfully",
        });
        setSelectedSession(null);
        setAttendanceData([]);
        // Refresh parent component data
        onMarkAttendance(selectedSession.id, { attendance: attendanceData });
      }
    } catch (error: any) {
      console.error('Failed to mark attendance:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to mark attendance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update individual student attendance
  const updateStudentAttendance = (studentId: number, field: 'status' | 'notes', value: string) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.student_id === studentId 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // Bulk status update
  const handleBulkStatusUpdate = (status: StudentAttendance['status']) => {
    setAttendanceData(prev => 
      prev.map(item => ({ ...item, status }))
    );
  };

  const filteredStudents = attendanceData.filter(student =>
    student.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const attendanceStats = {
    present: attendanceData.filter(a => a.status === 'present').length,
    late: attendanceData.filter(a => a.status === 'late').length,
    absent: attendanceData.filter(a => a.status === 'absent').length,
    excused: attendanceData.filter(a => a.status === 'excused').length,
    total: attendanceData.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Attendance Management</h2>
          <p className="text-muted-foreground">Mark and track student attendance for your sessions</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Reports
        </Button>
      </div>

      {!selectedSession ? (
        <Tabs defaultValue="mark" className="space-y-6">
          <TabsList>
            <TabsTrigger value="mark" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Mark Attendance
            </TabsTrigger>
            <TabsTrigger value="view" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              View Records
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Mark Attendance Tab */}
          <TabsContent value="mark" className="space-y-6">
            {sessionsNeedingAttendance.length > 0 ? (
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Sessions Needing Attendance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessionsNeedingAttendance.map((session) => (
                    <Card key={session.id} className="cursor-pointer hover:shadow-md transition-shadow bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-foreground">{session.title}</h4>
                            <p className="text-sm text-muted-foreground">{session.tutorial_title}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(session.start_time).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {session.student_count} students
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleSelectSession(session, 'mark')}
                          >
                            Mark Attendance
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="text-center py-12 bg-card border-border">
                <CardContent>
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No sessions need attendance marking at the moment.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* View Records Tab */}
          <TabsContent value="view" className="space-y-6">
            {completedSessionsWithAttendance.length > 0 ? (
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Attendance Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedSessionsWithAttendance.map((session) => (
                    <Card key={session.id} className="cursor-pointer hover:shadow-md transition-shadow bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-foreground">{session.title}</h4>
                            <p className="text-sm text-muted-foreground">{session.tutorial_title}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(session.start_time).toLocaleDateString()}
                              </div>
                              <Badge variant="secondary" className="bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Marked
                              </Badge>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSelectSession(session, 'view')}
                          >
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="text-center py-12 bg-card border-border">
                <CardContent>
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No attendance records</h3>
                  <p className="text-muted-foreground">Complete and mark attendance for sessions to see records here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Attendance Reports</CardTitle>
                <CardDescription>
                  Generate comprehensive attendance reports and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2 bg-background">
                    <BarChart3 className="w-6 h-6" />
                    <span>Tutorial-wise Reports</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2 bg-background">
                    <Users className="w-6 h-6" />
                    <span>Student Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        /* Attendance Marking/Viewing Interface */
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedSession(null);
                  setSessionAttendance(null);
                  setAttendanceData([]);
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  {activeView === 'mark' ? 'Mark Attendance' : 'View Attendance'}
                  {selectedSession.attendance_marked && (
                    <Badge variant="secondary" className="bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Marked
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {selectedSession.tutorial_title} • {new Date(selectedSession.start_time).toLocaleDateString()} • {selectedSession.student_count} students
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading attendance data...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceStats.present}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Present</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{attendanceStats.late}</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">Late</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceStats.absent}</div>
                    <div className="text-sm text-red-700 dark:text-red-300">Absent</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{attendanceStats.excused}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Excused</div>
                  </div>
                </div>

                {/* Bulk Actions */}
                {activeView === 'mark' && (
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-sm font-medium self-center text-foreground">Quick Actions:</span>
                    <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('present')}>
                      Mark All Present
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('absent')}>
                      Mark All Absent
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('late')}>
                      Mark All Late
                    </Button>
                  </div>
                )}

                {/* Search */}
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm bg-background"
                  />
                </div>

                {/* Student List */}
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <div key={student.student_id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{student.student_name}</div>
                        <div className="text-sm text-muted-foreground">{student.student_email}</div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Status Selection */}
                        <select
                          value={student.status}
                          onChange={(e) => updateStudentAttendance(student.student_id, 'status', e.target.value)}
                          disabled={activeView === 'view'}
                          className="border border-border rounded px-3 py-1 text-sm bg-background text-foreground"
                        >
                          <option value="present">Present</option>
                          <option value="late">Late</option>
                          <option value="absent">Absent</option>
                          <option value="excused">Excused</option>
                        </select>

                        {/* Notes */}
                        <Input
                          placeholder="Notes..."
                          value={student.notes}
                          onChange={(e) => updateStudentAttendance(student.student_id, 'notes', e.target.value)}
                          disabled={activeView === 'view'}
                          className="w-40 bg-background"
                        />

                        {/* Status Icon */}
                        {student.status === 'present' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {student.status === 'late' && <Clock className="w-5 h-5 text-yellow-500" />}
                        {student.status === 'absent' && <XCircle className="w-5 h-5 text-red-500" />}
                        {student.status === 'excused' && <Clock className="w-5 h-5 text-blue-500" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                {activeView === 'mark' && (
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleBulkMarkAttendance} 
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Save Attendance
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedSession(null)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}