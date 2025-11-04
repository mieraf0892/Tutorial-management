// types/student.ts
export interface Classroom {
  id: number;
  name: string;
  section: string;
  teacher: string;
  teacherEmail: string;
  room: string;
  theme: string;
  enrollmentCode: string;
  assignmentsDue: number;
  announcements: number;
  materials: number;
  grade: number;
  nextAssignment: string;
  nextDueDate: string;
}

export interface StreamItem {
  id: number;
  type: 'assignment' | 'announcement' | 'material';
  title: string;
  class: string;
  teacher: string;
  dueDate?: string;
  posted?: string;
  points?: number;
  status?: 'assigned' | 'turned-in' | 'graded' | 'missing';
  submitted?: boolean;
  grade?: number | null;
  description: string;
  attachments: number;
  comments: number;
}

export interface Assignment {
  id: number;
  title: string;
  class: string;
  dueDate: string;
  dueTime: string;
  points: number;
  status: 'due-soon' | 'due-tomorrow' | 'upcoming';
  submitted: boolean;
}

export interface PerformanceData {
  class: string;
  grade: number;
  average: number;
  assignments: number;
  completed: number;
}