// components/student-dashboard/ClassGrid.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, BookOpen, ChevronRight, Plus } from "lucide-react";

interface Classroom {
  id: number;
  name: string;
  section: string;
  teacher: string;
  theme: string;
  assignmentsDue: number;
  materials: number;
  grade: number;
  nextAssignment: string;
}

interface ClassGridProps {
  classes: Classroom[];
}

export default function ClassGrid({ classes }: ClassGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((classroom) => (
        <ClassCard key={classroom.id} classroom={classroom} />
      ))}
      
      {/* Join Class Card */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
        <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px] text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-gray-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Join Class</h3>
          <p className="text-gray-600 text-sm">Use a class code to join a new class</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ClassCard({ classroom }: { classroom: Classroom }) {
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
      <div className={`${classroom.theme} h-24 rounded-t-lg relative`}>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="font-bold text-lg">{classroom.name}</h3>
          <p className="text-white/90 text-sm">{classroom.section}</p>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{classroom.teacher}</span>
            <span className="font-semibold">{classroom.grade}%</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Current Grade</span>
              <span>{classroom.grade}%</span>
            </div>
            <Progress value={classroom.grade} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between text-sm pt-2">
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1 text-red-500">
                <FileText className="w-4 h-4" />
                {classroom.assignmentsDue}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {classroom.materials}
              </span>
            </div>
            
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {classroom.nextAssignment}
            </Badge>
          </div>
          
          <Button className="w-full group-hover:bg-gray-900 transition-colors" size="sm">
            Enter Class
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}