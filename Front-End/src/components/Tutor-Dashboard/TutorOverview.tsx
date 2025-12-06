// components/Tutor-Dashboard/TutorOverview.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, BookOpen, Calendar, ArrowUpRight, Clock, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Stats {
  total_tutorials: number;
  total_students: number;
  upcoming_sessions: number;
  completed_sessions: number;
  total_earnings: number;
  average_rating: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  tutorial_id: number;
  tutorial_title: string;
  enrollment_date: string;
  progress_percentage: number;
  last_accessed: string;
}

interface Tutorial {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  student_count: number;
  total_sessions: number;
  completed_sessions: number;
  created_at: string;
}

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
  attendance_marked: boolean;
}

interface Payment {
  id: number;
  amount: number;
  currency: string;
  description: string;
  status: "completed" | "pending" | "failed";
  date: string;
  tutorial_title: string;
}

interface TutorOverviewProps {
  stats: Stats;
  students: Student[];
  tutorials: Tutorial[];
  upcomingSessions: TutorialSession[];
  recentPayments: Payment[];
  onCreateTutorial: () => void;
  onViewStudents?: () => void;
  onViewSchedule?: () => void;
}

export default function TutorOverview({ 
  stats, 
  students, 
  tutorials,  
  recentPayments,
  onCreateTutorial,
  onViewStudents,
  onViewSchedule
}: TutorOverviewProps) {
  const navigate = useNavigate();

  // Default handlers if not provided
  const handleViewStudents = onViewStudents || (() => navigate("/tutor/students"));
  const handleViewSchedule = onViewSchedule || (() => navigate("/tutor/schedule"));

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Create New Tutorial</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Start a new tutorial and reach more students
            </p>
            <Button size="sm" className="w-full" onClick={onCreateTutorial}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tutorial
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Manage Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              {stats?.total_students || 0} total students enrolled
            </p>
            <Button variant="outline" size="sm" className="w-full" onClick={handleViewStudents}>
              <Users className="h-4 w-4 mr-2" />
              View Students
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Upcoming Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              {stats?.upcoming_sessions || 0} sessions scheduled
            </p>
            <Button variant="outline" size="sm" className="w-full" onClick={handleViewSchedule}>
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Students Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Recent Students</CardTitle>
              <CardDescription>
                Your recently enrolled students and their progress
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleViewStudents}>
              View All
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {students && students.length > 0 ? (
            <div className="space-y-4">
              {students.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.tutorial_title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{student.progress_percentage}%</p>
                    <p className="text-sm text-muted-foreground">Progress</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No students enrolled yet</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={onCreateTutorial}>
                Create your first tutorial
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Tutorials & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tutorials */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Recent Tutorials</CardTitle>
            <CardDescription>Your most recent tutorials</CardDescription>
          </CardHeader>
          <CardContent>
            {tutorials && tutorials.length > 0 ? (
              tutorials.slice(0, 3).map((tutorial) => (
                <div key={tutorial.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{tutorial.title}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{tutorial.student_count} students</span>
                      <span>{tutorial.completed_sessions}/{tutorial.total_sessions} sessions</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/tutor/tutorials/${tutorial.id}`)}>
                    View
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No tutorials created yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Recent Payments</CardTitle>
            <CardDescription>Latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPayments && recentPayments.length > 0 ? (
              recentPayments.slice(0, 3).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{payment.tutorial_title}</p>
                    <p className="text-sm text-muted-foreground">
                      ${payment.amount} • {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    payment.status === 'completed' 
                      ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400' 
                      : payment.status === 'pending'
                      ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400'
                  }`}>
                    {payment.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No payments yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Performance Summary</CardTitle>
          <CardDescription>Your overall tutoring performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-border rounded-lg">
              <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats?.total_tutorials || 0}</p>
              <p className="text-sm text-muted-foreground">Tutorials</p>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats?.total_students || 0}</p>
              <p className="text-sm text-muted-foreground">Students</p>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats?.completed_sessions || 0}</p>
              <p className="text-sm text-muted-foreground">Sessions Completed</p>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <CreditCard className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">${stats?.total_earnings || 0}</p>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}