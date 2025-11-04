// components/student-dashboard/ClassList.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface Classroom {
  id: number;
  name: string;
  section: string;
  teacher: string;
  theme: string;
  assignmentsDue: number;
  grade: number;
}

interface ClassListProps {
  classes: Classroom[];
}

export default function ClassList({ classes }: ClassListProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {classes.map((classroom) => (
            <div key={classroom.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-lg ${classroom.theme} flex items-center justify-center text-white font-bold text-lg`}>
                  {classroom.name.split(' ').map(w => w[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{classroom.name}</h3>
                  <p className="text-gray-600 text-sm">{classroom.section} • {classroom.teacher}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-500">{classroom.assignmentsDue} assignments due</span>
                    <span className="text-sm font-medium text-gray-900">Grade: {classroom.grade}%</span>
                  </div>
                </div>
                <Button>
                  Enter
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}