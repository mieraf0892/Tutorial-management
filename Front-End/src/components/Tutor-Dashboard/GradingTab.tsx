// components/tutor-dashboard/GradingTab.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface Submission {
  id: number;
  student: string;
  studentEmail: string;
  assignment: string;
  class: string;
  status: 'pending' | 'graded';
  submitted: string;
  dueDate: string;
  points: number;
  grade?: number;
  attachments: number;
}

interface GradingAssignment {
  id: number;
  assignment: string;
  class: string;
  submissions: number;
  dueDate: string;
  graded: number;
  totalPoints: number;
}

interface GradingTabProps {
  recentSubmissions: Submission[];
  upcomingGrading: GradingAssignment[];
  onGradeSubmission: (submission: Submission) => void;
}

export default function GradingTab({ recentSubmissions, upcomingGrading, onGradeSubmission }: GradingTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Upcoming Grading */}
      <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Submissions to Grade
          </CardTitle>
          <CardDescription>Recent student submissions awaiting your review</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {recentSubmissions.map((submission) => (
              <SubmissionItem 
                key={submission.id} 
                submission={submission}
                onGrade={onGradeSubmission}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grading Progress */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Grading Progress</CardTitle>
          <CardDescription>Assignment grading status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingGrading.map((assignment) => (
            <GradingProgressItem key={assignment.id} assignment={assignment} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SubmissionItem({ submission, onGrade }: { 
  submission: Submission; 
  onGrade: (submission: Submission) => void;
}) {
  return (
    <div 
      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onGrade(submission)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-xs">
              {submission.student.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-gray-900">{submission.student}</h4>
            <p className="text-sm text-gray-600">
              {submission.assignment} • {submission.class}
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span>Submitted {submission.submitted}</span>
              <span>{submission.attachments} attachment{submission.attachments !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={
            submission.status === "graded" ? "default" : 
            submission.status === "pending" ? "secondary" : "outline"
          } className="flex items-center gap-1">
            {submission.status === "graded" && <CheckCircle2 className="w-3 h-3" />}
            {submission.status === "pending" && <AlertCircle className="w-3 h-3" />}
            {submission.status === "graded" ? `Graded: ${submission.grade}/${submission.points}` : 'Needs Review'}
          </Badge>
          <Button size="sm">
            {submission.status === "pending" ? "Grade" : "View"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function GradingProgressItem({ assignment }: { assignment: GradingAssignment }) {
  const progress = (assignment.graded / assignment.submissions) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900 text-sm">{assignment.assignment}</h4>
        <span className="text-xs text-gray-500">{assignment.graded}/{assignment.submissions}</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{assignment.class}</span>
        <span>Due {assignment.dueDate}</span>
      </div>
    </div>
  );
}