// components/Student-Dashboard/StudentOverview.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Calendar, ArrowUpRight, Clock, Play, TrendingUp } from "lucide-react";

interface StudentOverviewProps {
  stats: any;
  enrolledTutorials: any[];
  recentActivities: any[];
  upcomingLessons: any[];
  scheduledSessions: any[];
  paymentHistory: any[];
  onViewTutorials: () => void;
  onViewSchedule: () => void;
  onJoinClass: () => void;
}

export default function StudentOverview({
  stats,
  enrolledTutorials,
  recentActivities,
  upcomingLessons,
  scheduledSessions,
  onViewTutorials,
  onViewSchedule,
  onJoinClass
}: StudentOverviewProps) {

  // Debug log to verify data is received
  console.log('StudentOverview - scheduledSessions:', scheduledSessions);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Browse Tutorials</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Discover new tutorials to expand your knowledge
            </p>
            <Button 
              size="sm" 
              className="w-full"
              onClick={onJoinClass}
            >
              <Plus className="h-4 w-4 mr-2" />
              Browse Tutorials
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Continue Learning</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              {stats?.in_progress_tutorials || 0} tutorials in progress
            </p>
            <Button variant="outline" size="sm" className="w-full" onClick={onViewTutorials}>
              <BookOpen className="h-4 w-4 mr-2" />
              My Tutorials
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              {stats?.upcoming_sessions || 0} sessions scheduled
            </p>
            <Button variant="outline" size="sm" className="w-full" onClick={onViewSchedule}>
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activities</CardTitle>
            <CardDescription>Your latest learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.tutorial_name}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent activities</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Lessons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Upcoming Lessons</CardTitle>
            <CardDescription>Lessons to complete soon</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingLessons && upcomingLessons.length > 0 ? (
              <div className="space-y-3">
                {upcomingLessons.slice(0, 3).map((lesson, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-foreground">{lesson.lesson_title}</p>
                      <p className="text-xs text-muted-foreground">{lesson.tutorial_title}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Start
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming lessons</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Upcoming Sessions</CardTitle>
              <CardDescription>
                Your scheduled tutorial sessions
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onViewSchedule}>
              View Schedule
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {scheduledSessions && scheduledSessions.length > 0 ? (
            <div className="space-y-3">
              {scheduledSessions.slice(0, 3).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">{session.tutorial_title}</div>
                    <div className="text-xs text-muted-foreground">with {session.tutor_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(session.start_time).toLocaleDateString()} • 
                      {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {session.meeting_link ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => window.open(session.meeting_link, '_blank')}
                    >
                      Join
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      No Link
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming sessions scheduled</p>
              <p className="text-xs text-muted-foreground mt-1">
                Sessions will appear here when scheduled by your tutors
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrolled Tutorials */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">My Tutorials</CardTitle>
              <CardDescription>
                Tutorials you're currently enrolled in
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onViewTutorials}>
              View All
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {enrolledTutorials && enrolledTutorials.length > 0 ? (
            <div className="space-y-4">
              {enrolledTutorials.slice(0, 3).map((tutorial) => (
                <div key={tutorial.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{tutorial.title}</p>
                      <p className="text-sm text-muted-foreground">by {tutorial.instructor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{tutorial.progress_percentage}%</p>
                    <p className="text-sm text-muted-foreground">Progress</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tutorials enrolled yet</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={onJoinClass}>
                Browse tutorials
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}