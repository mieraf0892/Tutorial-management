// components/tutor-dashboard/ClassesTab.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, FileText, BookOpen, Edit, Eye } from "lucide-react";

interface ClassItem {
  id: number;
  name: string;
  section: string;
  students: number;
  color: string;
  assignments: number;
  avgGrade: number;
  pendingSubmissions: number;
  nextAssignment: string;
  enrollmentCode: string;
}

interface ClassesTabProps {
  classes: ClassItem[];
  onCreateClass: () => void;
}

export default function ClassesTab({ classes, onCreateClass }: ClassesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Classes</h2>
          <p className="text-gray-600">Manage your classrooms and course content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <ClassCard key={classItem.id} classItem={classItem} />
        ))}
        
        <CreateClassCard onCreateClass={onCreateClass} />
      </div>
    </div>
  );
}

function ClassCard({ classItem }: { classItem: ClassItem }) {
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
      <div className={`${classItem.color} h-24 rounded-t-lg relative`}>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="font-bold text-lg">{classItem.name}</h3>
          <p className="text-white/90 text-sm">{classItem.section}</p>
        </div>
        <Badge className="absolute top-4 right-4 bg-white/20 text-white border-white/30">
          {classItem.students} students
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Enrollment Code</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
              {classItem.enrollmentCode}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Average Grade</span>
              <span className="font-semibold">{classItem.avgGrade}%</span>
            </div>
            <Progress value={classItem.avgGrade} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm pt-2">
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1 text-red-500">
                <FileText className="w-4 h-4" />
                {classItem.pendingSubmissions}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {classItem.assignments}
              </span>
            </div>
            
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
              Next: {classItem.nextAssignment}
            </Badge>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Edit className="w-4 h-4 mr-2" />
              Manage
            </Button>
            <Button size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateClassCard({ onCreateClass }: { onCreateClass: () => void }) {
  return (
    <Card 
      className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
      onClick={onCreateClass}
    >
      <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px] text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Plus className="w-6 h-6 text-gray-600" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Create Class</h3>
        <p className="text-gray-600 text-sm">Set up a new classroom for your students</p>
      </CardContent>
    </Card>
  );
}