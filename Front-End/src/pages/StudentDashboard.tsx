// StudentDashboard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Calendar, Plus, Search, BookOpen, Grid3X3, FileText, List } from "lucide-react";

// Import components
import QuickStats from "@/components/Student-Dashboard/QuickStats";
import ClassGrid from "@/components/Student-Dashboard/ClassGrid";
import ClassList from "@/components/Student-Dashboard/ClassList";
import StreamTab from "@/components/Student-Dashboard/StreamTab";
import WorkTab from "@/components/Student-Dashboard/WorkTab";

// Import data
import { enrolledClasses, streamItems, upcomingAssignments, performanceData } from "@/data/student-data";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("stream");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar userRole="student" onLogout={handleLogout} />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
              <p className="text-gray-600">Welcome back, Alex! Here's your work for today.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Join Class
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuickStats />
        
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="grid w-full md:w-auto grid-cols-3">
                <TabsTrigger value="stream" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Stream
                </TabsTrigger>
                <TabsTrigger value="classes" className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Classes
                </TabsTrigger>
                <TabsTrigger value="work" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  To-do
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search classes, assignments..."
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <TabsContent value="stream">
              <StreamTab 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                streamItems={streamItems as any}
                upcomingAssignments={upcomingAssignments}
              />
            </TabsContent>

            <TabsContent value="classes">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Your Classes</h2>
                  <p className="text-gray-600">Click on a class to view assignments and materials</p>
                </div>
                <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
              </div>

              {viewMode === "grid" ? (
                <ClassGrid classes={enrolledClasses} />
              ) : (
                <ClassList classes={enrolledClasses} />
              )}
            </TabsContent>

            <TabsContent value="work">
              <WorkTab 
                upcomingAssignments={upcomingAssignments}
                performanceData={performanceData}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function ViewModeToggle({ viewMode, setViewMode }: { 
  viewMode: "grid" | "list"; 
  setViewMode: (mode: "grid" | "list") => void 
}) {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant={viewMode === "grid" ? "default" : "outline"} 
        size="icon"
        onClick={() => setViewMode("grid")}
      >
        <Grid3X3 className="w-4 h-4" />
      </Button>
      <Button 
        variant={viewMode === "list" ? "default" : "outline"} 
        size="icon"
        onClick={() => setViewMode("list")}
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
}