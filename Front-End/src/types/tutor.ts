// types/tutor.ts
export interface ClassItem {
  id: number;
  name: string;
  section: string;
  students: number;
  color: string;
  assignments: number;
  avgGrade: number;
  pendingSubmissions: number;
  nextAssignment: string;
  nextDueDate: string;
  enrollmentCode: string;
}

export interface Submission {
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

export interface GradingAssignment {
  id: number;
  assignment: string;
  class: string;
  submissions: number;
  dueDate: string;
  graded: number;
  totalPoints: number;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  class: string;
  submissions: number;
  avgGrade: number;
  pending: number;
  trend: 'up' | 'down';
}