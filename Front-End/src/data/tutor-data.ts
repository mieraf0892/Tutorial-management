// data/tutor-data.ts
export const myClasses = [
  {
    id: 1,
    name: "Advanced React Development",
    section: "CS-401 - Fall 2024",
    students: 45,
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
    assignments: 8,
    avgGrade: 85,
    pendingSubmissions: 12,
    nextAssignment: "React Hooks Project",
    nextDueDate: "Dec 15, 2024",
    enrollmentCode: "react2024"
  },
  {
    id: 2,
    name: "JavaScript Fundamentals",
    section: "CS-201 - Fall 2024",
    students: 62,
    color: "bg-gradient-to-br from-green-500 to-green-700",
    assignments: 12,
    avgGrade: 78,
    pendingSubmissions: 8,
    nextAssignment: "Midterm Exam",
    nextDueDate: "Dec 18, 2024",
    enrollmentCode: "jsfund2024"
  },
  {
    id: 3,
    name: "Web Design Bootcamp",
    section: "DSGN-301 - Fall 2024",
    students: 38,
    color: "bg-gradient-to-br from-purple-500 to-purple-700",
    assignments: 10,
    avgGrade: 92,
    pendingSubmissions: 5,
    nextAssignment: "Portfolio Design",
    nextDueDate: "Dec 12, 2024",
    enrollmentCode: "webdesign2024"
  }
];

export const recentSubmissions = [
  { 
    id: 1, 
    student: "Alice Johnson", 
    studentEmail: "alice.j@student.edu",
    assignment: "React Hooks Project", 
    class: "Advanced React Development", 
    status: "pending",
    submitted: "2 hours ago",
    dueDate: "Dec 15, 2024",
    points: 100,
    attachments: 2
  },
  { 
    id: 2, 
    student: "Bob Smith", 
    studentEmail: "bob.s@student.edu",
    assignment: "Final Project", 
    class: "JavaScript Fundamentals", 
    status: "graded",
    submitted: "1 day ago",
    dueDate: "Dec 10, 2024",
    points: 200,
    grade: 185,
    attachments: 3
  },
  { 
    id: 3, 
    student: "Carol White", 
    studentEmail: "carol.w@student.edu",
    assignment: "Portfolio Design", 
    class: "Web Design Bootcamp", 
    status: "pending",
    submitted: "3 hours ago",
    dueDate: "Dec 12, 2024",
    points: 150,
    attachments: 1
  },
  { 
    id: 4, 
    student: "David Brown", 
    studentEmail: "david.b@student.edu",
    assignment: "Component Library", 
    class: "Advanced React Development", 
    status: "pending",
    submitted: "Just now",
    dueDate: "Dec 14, 2024",
    points: 75,
    attachments: 4
  },
];

export const upcomingGrading = [
  {
    id: 1,
    assignment: "React Hooks Project",
    class: "Advanced React Development",
    submissions: 12,
    dueDate: "Dec 15, 2024",
    graded: 3,
    totalPoints: 100
  },
  {
    id: 2,
    assignment: "Midterm Exam",
    class: "JavaScript Fundamentals",
    submissions: 8,
    dueDate: "Dec 18, 2024",
    graded: 0,
    totalPoints: 200
  },
  {
    id: 3,
    assignment: "Portfolio Design",
    class: "Web Design Bootcamp",
    submissions: 5,
    dueDate: "Dec 12, 2024",
    graded: 2,
    totalPoints: 150
  }
];

export const studentPerformance = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.j@student.edu",
    class: "Advanced React Development",
    submissions: 8,
    avgGrade: 92,
    pending: 1,
    trend: "up"
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob.s@student.edu",
    class: "JavaScript Fundamentals",
    submissions: 6,
    avgGrade: 78,
    pending: 2,
    trend: "down"
  },
  {
    id: 3,
    name: "Carol White",
    email: "carol.w@student.edu",
    class: "Web Design Bootcamp",
    submissions: 10,
    avgGrade: 95,
    pending: 0,
    trend: "up"
  }
];