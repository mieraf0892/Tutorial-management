// types/admin.ts
export interface SystemStat {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  color: string;
  description: string;
}

export interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  status: string;
  avatar: string;
  lastActive: string;
  joinDate: string;
  classes: number;
}

export interface ClassItem {
  id: number;
  name: string;
  students: number;
  tutor: string;
  rating: number;
  subject: string;
  color: string;
  enrollmentCode: string;
  assignments: number;
  active: boolean;
  completionRate: number;
}

export interface Metric {
  metric: string;
  value: number;
  target: number;
  trend: "up" | "down";
}

export interface Activity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  type: string;
}