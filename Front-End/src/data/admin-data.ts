// data/admin-data.ts
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react";

export const systemStats = [
  { 
    label: "Total Students", 
    value: "1,234", 
    change: "+12%", 
    trend: "up",
    icon: Users, 
    color: "blue",
    description: "Active enrollments"
  },
  { 
    label: "Active Tutors", 
    value: "89", 
    change: "+5%", 
    trend: "up",
    icon: GraduationCap, 
    color: "green",
    description: "Teaching this month"
  },
  { 
    label: "Total Classes", 
    value: "156", 
    change: "+8%", 
    trend: "up",
    icon: BookOpen, 
    color: "purple",
    description: "Across all subjects"
  },
  { 
    label: "Platform Growth", 
    value: "+23%", 
    change: "+3%", 
    trend: "up",
    icon: TrendingUp, 
    color: "orange",
    description: "This quarter"
  },
];

export const recentUsers = [
  { 
    id: 1, 
    name: "Alice Johnson", 
    role: "student", 
    email: "alice@example.com", 
    status: "active",
    avatar: "/avatars/alice.jpg",
    lastActive: "2 hours ago",
    joinDate: "2024-09-15",
    classes: 4
  },
  { 
    id: 2, 
    name: "Bob Smith", 
    role: "tutor", 
    email: "bob@example.com", 
    status: "active",
    avatar: "/avatars/bob.jpg",
    lastActive: "Just now",
    joinDate: "2024-08-22",
    classes: 8
  },
  { 
    id: 3, 
    name: "Carol White", 
    role: "student", 
    email: "carol@example.com", 
    status: "pending",
    avatar: "/avatars/carol.jpg",
    lastActive: "1 day ago",
    joinDate: "2024-10-05",
    classes: 2
  },
  { 
    id: 4, 
    name: "David Brown", 
    role: "tutor", 
    email: "david@example.com", 
    status: "active",
    avatar: "/avatars/david.jpg",
    lastActive: "30 minutes ago",
    joinDate: "2024-07-12",
    classes: 6
  },
];

export const popularClasses = [
  { 
    id: 1, 
    name: "Advanced React Development", 
    students: 145, 
    tutor: "Dr. Sarah Johnson", 
    rating: 4.8,
    subject: "Computer Science",
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
    enrollmentCode: "react2024",
    assignments: 12,
    active: true,
    completionRate: 78
  },
  { 
    id: 2, 
    name: "JavaScript Fundamentals", 
    students: 198, 
    tutor: "Prof. Michael Chen", 
    rating: 4.9,
    subject: "Programming",
    color: "bg-gradient-to-br from-green-500 to-green-700",
    enrollmentCode: "jsfund2024",
    assignments: 8,
    active: true,
    completionRate: 92
  },
  { 
    id: 3, 
    name: "Database Design Principles", 
    students: 132, 
    tutor: "Emma Williams", 
    rating: 4.7,
    subject: "Data Science",
    color: "bg-gradient-to-br from-purple-500 to-purple-700",
    enrollmentCode: "dbdesign2024",
    assignments: 10,
    active: false,
    completionRate: 65
  },
];

export const platformAnalytics = [
  { metric: "User Engagement", value: 76, target: 80, trend: "up" },
  { metric: "Course Completion", value: 88, target: 85, trend: "up" },
  { metric: "Tutor Satisfaction", value: 92, target: 90, trend: "up" },
  { metric: "System Uptime", value: 99.8, target: 99.5, trend: "up" },
];

export const recentActivities = [
  {
    id: 1,
    user: "Sarah Johnson",
    action: "created new class",
    target: "Advanced React Development",
    time: "10 minutes ago",
    type: "class"
  },
  {
    id: 2,
    user: "System",
    action: "automated backup completed",
    target: "Database backup",
    time: "1 hour ago",
    type: "system"
  },
  {
    id: 3,
    user: "Mike Chen",
    action: "updated course materials",
    target: "JavaScript Fundamentals",
    time: "2 hours ago",
    type: "material"
  },
  {
    id: 4,
    user: "Admin",
    action: "approved tutor application",
    target: "David Brown",
    time: "3 hours ago",
    type: "user"
  }
];