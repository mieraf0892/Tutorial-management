// components/Admin-Dashboard/ReportingTab.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Search, Calendar, Users, FileText, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

interface PendingReport {
  id: number;
  session_id: number;
  tutor_name: string;
  session_title: string;
  session_date: string;
  students_present: number;
  total_students: number;
  submitted_at: string;
}

interface ReportingTabProps {
  pendingReports: PendingReport[];
  onApproveReport: (reportId: number) => void;
  searchQuery: string;
  onRefresh?: () => void;
}

export default function ReportingTab({
  pendingReports,
  onApproveReport,
  searchQuery,
  onRefresh
}: ReportingTabProps) {
  const [filteredReports, setFilteredReports] = useState<PendingReport[]>(pendingReports);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAttendanceRate = (present: number, total: number) => {
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  // Filter reports based on search query
  useEffect(() => {
    const filtered = pendingReports.filter(report =>
      report.tutor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.session_title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredReports(filtered);
  }, [searchQuery, pendingReports]);

  if (pendingReports.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Session Reports</h2>
            <p className="text-muted-foreground">Approve session reports and attendance records</p>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRefresh}
                className="bg-card hover:bg-accent border-border"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            )}
            <Badge variant="outline" className="px-3 py-1 bg-card border-border">
              {pendingReports.length} Pending
            </Badge>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-4">
              <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              All Reports Approved
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              There are no pending session reports requiring approval.
              New reports will appear here after tutors submit their session summaries.
            </p>
            {onRefresh && (
              <Button 
                variant="outline" 
                onClick={onRefresh}
                className="mt-4 bg-card hover:bg-accent border-border"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check for New Reports
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Session Reports</h2>
          <p className="text-muted-foreground">Approve session reports and attendance records</p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              className="bg-card hover:bg-accent border-border"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          )}
          <Badge variant="destructive" className="px-3 py-1">
            {pendingReports.length} Pending
          </Badge>
        </div>
      </div>

      {/* Search results info */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground bg-card border border-border rounded-lg p-3">
          Showing {filteredReports.length} of {pendingReports.length} reports matching "{searchQuery}"
        </div>
      )}

      <div className="grid gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-4">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg text-foreground">{report.session_title}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-2 text-muted-foreground">
                    <span>By {report.tutor_name}</span>
                    <span>•</span>
                    <span>Submitted {formatDate(report.submitted_at)}</span>
                  </CardDescription>
                </div>
                <Badge variant="outline" className="flex items-center gap-1 bg-card border-border">
                  <Calendar className="w-3 h-3" />
                  {formatDate(report.session_date)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                  <Users className="w-4 h-4 text-green-500 dark:text-green-400" />
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {report.students_present} / {report.total_students}
                    </div>
                    <div className="text-xs text-muted-foreground">Students Present</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                  <div className="w-4 h-4 text-blue-500 dark:text-blue-400 font-bold">%</div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {calculateAttendanceRate(report.students_present, report.total_students)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Attendance Rate</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                  <FileText className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Session #{report.session_id}
                    </div>
                    <div className="text-xs text-muted-foreground">Report ID</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // View details logic would go here
                    console.log('View report details:', report.id);
                  }}
                  className="bg-card hover:bg-accent border-border"
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  onClick={() => onApproveReport(report.id)}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && pendingReports.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Search className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No matching reports found
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Try adjusting your search terms to find the reports you're looking for.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setFilteredReports(pendingReports)}
              className="mt-4 bg-card hover:bg-accent border-border"
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {filteredReports.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="text-muted-foreground">
                Showing {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-muted-foreground">
                    Average Attendance: {Math.round(
                      filteredReports.reduce((acc, report) => 
                        acc + calculateAttendanceRate(report.students_present, report.total_students), 0
                      ) / filteredReports.length
                    )}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}