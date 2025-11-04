// data/student-data.ts
export const enrolledClasses = [
  {
    id: 1,
    name: "Advanced React Development",
    section: "Computer Science - Fall 2024",
    teacher: "Dr. Sarah Johnson",
    teacherEmail: "sarah.j@university.edu",
    room: "Virtual Classroom",
    theme: "bg-gradient-to-br from-blue-500 to-blue-700",
    enrollmentCode: "x7y8z9a",
    assignmentsDue: 3,
    announcements: 2,
    materials: 15,
    grade: 92,
    nextAssignment: "React Hooks Project",
    nextDueDate: "Dec 15, 2024"
  },
  {
    id: 2,
    name: "JavaScript Fundamentals",
    section: "Programming Basics - Fall 2024",
    teacher: "Prof. Michael Chen",
    teacherEmail: "michael.chen@university.edu",
    room: "Online",
    theme: "bg-gradient-to-br from-green-500 to-green-700",
    enrollmentCode: "b5c6d7e",
    assignmentsDue: 1,
    announcements: 0,
    materials: 10,
    grade: 87,
    nextAssignment: "Midterm Exam",
    nextDueDate: "Dec 18, 2024"
  },
  {
    id: 3,
    name: "Database Design Principles",
    section: "Data Science - Fall 2024",
    teacher: "Emma Williams",
    teacherEmail: "emma.w@university.edu",
    room: "Lab 301",
    theme: "bg-gradient-to-br from-purple-500 to-purple-700",
    enrollmentCode: "f8g9h0i",
    assignmentsDue: 2,
    announcements: 1,
    materials: 18,
    grade: 95,
    nextAssignment: "Normalization Exercise",
    nextDueDate: "Dec 12, 2024"
  }
];

export const streamItems = [
  {
    id: 1,
    type: "assignment",
    title: "React Hooks Assignment",
    class: "Advanced React Development",
    teacher: "Dr. Sarah Johnson",
    dueDate: "Dec 15, 2024",
    points: 100,
    status: "assigned",
    submitted: false,
    grade: null,
    description: "Create a custom hook for form validation and implement it in a sample application.",
    attachments: 3,
    comments: 12
  },
  {
    id: 2,
    type: "announcement",
    title: "Important: Final Project Guidelines",
    class: "JavaScript Fundamentals",
    teacher: "Prof. Michael Chen",
    posted: "2 hours ago",
    description: "Please review the final project guidelines document. We'll discuss this in our next live session.",
    attachments: 1,
    comments: 8
  },
  {
    id: 3,
    type: "material",
    title: "Database Normalization Slides",
    class: "Database Design Principles",
    teacher: "Emma Williams",
    posted: "1 day ago",
    description: "Slides from yesterday's lecture on database normalization forms (1NF, 2NF, 3NF).",
    attachments: 2,
    comments: 5
  },
  {
    id: 4,
    type: "assignment",
    title: "Midterm Exam",
    class: "JavaScript Fundamentals",
    teacher: "Prof. Michael Chen",
    dueDate: "Dec 18, 2024",
    points: 200,
    status: "assigned",
    submitted: false,
    grade: null,
    description: "Comprehensive exam covering all topics from weeks 1-8.",
    attachments: 1,
    comments: 23
  },
  {
    id: 5,
    type: "assignment",
    title: "Previous Assignment - Graded",
    class: "Advanced React Development",
    teacher: "Dr. Sarah Johnson",
    dueDate: "Dec 5, 2024",
    points: 50,
    status: "graded",
    submitted: true,
    grade: 45,
    description: "Component lifecycle methods exercise.",
    attachments: 2,
    comments: 5
  }
];

export const upcomingAssignments = [
  {
    id: 1,
    title: "React Hooks Assignment",
    class: "Advanced React Development",
    dueDate: "Dec 15, 2024",
    dueTime: "11:59 PM",
    points: 100,
    status: "due-soon",
    submitted: false
  },
  {
    id: 2,
    title: "Midterm Exam",
    class: "JavaScript Fundamentals",
    dueDate: "Dec 18, 2024",
    dueTime: "3:00 PM",
    points: 200,
    status: "upcoming",
    submitted: false
  },
  {
    id: 3,
    title: "Normalization Exercise",
    class: "Database Design Principles",
    dueDate: "Dec 12, 2024",
    dueTime: "5:00 PM",
    points: 50,
    status: "due-tomorrow",
    submitted: false
  }
];

export const performanceData = [
  { class: "Advanced React", grade: 92, average: 85, assignments: 12, completed: 10 },
  { class: "JavaScript Fundamentals", grade: 87, average: 82, assignments: 8, completed: 7 },
  { class: "Database Design", grade: 95, average: 88, assignments: 10, completed: 9 }
];