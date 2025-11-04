// components/admin-dashboard/ClassesTab.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, BookOpen } from "lucide-react";

interface ClassItem {
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

interface ClassesTabProps {
  classes: ClassItem[];
  onSelectClass: (classItem: ClassItem) => void;
}

export default function ClassesTab({ classes, onSelectClass }: ClassesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">All Classes</h2>
          <p className="text-gray-600">Manage and monitor all platform classes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <ClassCard 
            key={classItem.id} 
            classItem={classItem}
            onSelect={onSelectClass}
          />
        ))}
      </div>
    </div>
  );
}

function ClassCard({ classItem, onSelect }: { 
  classItem: ClassItem;
  onSelect: (classItem: ClassItem) => void;
}) {
  return (
    <Card 
      className="border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
      onClick={() => onSelect(classItem)}
    >
      <div className={`${classItem.color} h-24 rounded-t-lg relative`}>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="font-bold text-lg">{classItem.name}</h3>
          <p className="text-white/90 text-sm">{classItem.subject}</p>
        </div>
        <Badge className="absolute top-4 right-4 bg-white/20 text-white border-white/30">
          {classItem.active ? 'Active' : 'Archived'}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{classItem.tutor}</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
              {classItem.enrollmentCode}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Completion Rate</span>
              <span className="font-semibold">{classItem.completionRate}%</span>
            </div>
            <Progress value={classItem.completionRate} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm pt-2">
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {classItem.students}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {classItem.assignments}
              </span>
            </div>
            
            <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
              ⭐ {classItem.rating}
            </Badge>
          </div>
          
          <Button className="w-full group-hover:bg-gray-900 transition-colors" size="sm">
            Manage Class
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}