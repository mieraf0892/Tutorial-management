// TutorDashboard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CreateClassDialog } from "@/components/dialogs/CreateClassDialog";
import { GradeSubmissionDialog } from "@/components/dialogs/GradeSubmissionDialog";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Calendar, Plus, Search, Filter, BookOpen, FileText, Users} from "lucide-react";

// Import components
import QuickStats from "@/components/Tutor-Dashboard/QuickStats";
import ClassesTab from "@/components/Tutor-Dashboard/ClassesTab";
import GradingTab from "@/components/Tutor-Dashboard/GradingTab";
import StudentsTab from "@/components/Tutor-Dashboard/StudentsTab";

// Import data
import { myClasses, recentSubmissions, upcomingGrading, studentPerformance } from "@/data/tutor-data";

export default function TutorDashboard() {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("classes");
  const [searchQuery, setSearchQuery] = useState("");
  const { logout } = useAuth(); // ✅ Get logout from useAuth


  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar userRole="tutor" onLogout={handleLogout} />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Classroom</h1>
              <p className="text-gray-600">Manage your classes and student progress</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Class
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuickStats classes={myClasses} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid w-full md:w-auto grid-cols-3">
              <TabsTrigger value="classes" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                My Classes
              </TabsTrigger>
              <TabsTrigger value="grading" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Grading
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Students
              </TabsTrigger>
            </TabsList>
            
            <SearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          <TabsContent value="classes">
            <ClassesTab 
              classes={myClasses}
              onCreateClass={() => setShowCreateDialog(true)}
            />
          </TabsContent>

          <TabsContent value="grading">
            <GradingTab
              recentSubmissions={recentSubmissions}
              upcomingGrading={upcomingGrading}
              onGradeSubmission={setSelectedSubmission}
            />
          </TabsContent>

          <TabsContent value="students">
            <StudentsTab students={studentPerformance} />
          </TabsContent>
        </Tabs>
      </main>

      <CreateClassDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <GradeSubmissionDialog
        open={!!selectedSubmission}
        onOpenChange={(open) => !open && setSelectedSubmission(null)}
        submission={selectedSubmission || {
          student: "Student Name", 
          studentEmail: "",
          assignment: "Assignment", 
          class: "Class",
          submitted: "",
          dueDate: "",
          points: 0,
          attachments: 0,
          status: "pending",
          grade: null
        }}
      />
    </div>
  );
}

function SearchBar({ searchQuery, setSearchQuery }: { 
  searchQuery: string; 
  setSearchQuery: (query: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search classes, assignments..."
          className="pl-10 w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button variant="outline" size="icon">
        <Filter className="w-4 h-4" />
      </Button>
    </div>
  );
}