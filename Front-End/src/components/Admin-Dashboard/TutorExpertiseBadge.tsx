// components/Admin-Dashboard/TutorExpertiseBadge.tsx
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, TrendingUp } from "lucide-react";

interface TutorExpertiseProps {
  tutor: TutorWithExpertise;
  compact?: boolean;
}

export function TutorExpertiseBadge({ tutor, compact = false }: TutorExpertiseProps) {
  if (!tutor.subjects || tutor.subjects.length === 0) {
    return <Badge variant="outline">No specialization</Badge>;
  }

  // Group by subject name for display
  const subjectsMap = new Map();
  tutor.subjects.forEach(subject => {
    const key = subject.subject_name;
    if (!subjectsMap.has(key)) {
      subjectsMap.set(key, []);
    }
    subjectsMap.get(key).push(subject);
  });

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {Array.from(subjectsMap.keys()).map(subjectName => (
          <Badge key={subjectName} variant="secondary" className="text-xs">
            {subjectName}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from(subjectsMap.entries()).map(([subjectName, specializations]) => (
        <div key={subjectName} className="border rounded-lg p-2">
          <div className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {subjectName}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {specializations.map((spec: any, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {spec.specialization || 'General'}
                <span className="ml-1 text-muted-foreground">
                  ({spec.level})
                </span>
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}