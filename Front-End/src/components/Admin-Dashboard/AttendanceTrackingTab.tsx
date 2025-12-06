// components/Admin-Dashboard/AttendanceTrackingTab.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Download, Calendar, Users, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { useState } from "react";

interface AttendanceRecord {
  id: number;
  session_id: number;
  session_title: string;
  tutor_name: string;
  student_name: string;
  student_email: string;
  session_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  duration_minutes: number;
  joined_at?: string;
  left_at?: string;
}

interface AttendanceTrackingTabProps {
  searchQuery: string;
  onRefresh?: () => void;
}

export default function AttendanceTrackingTab({ searchQuery, onRefresh }: AttendanceTrackingTabProps) {
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);

  // Mock data - replace with actual API call
  const attendanceData: AttendanceRecord[] = [
    {
      id: 1,
      session_id: 101,
      session_title: "React Fundamentals - Session 1",
      tutor_name: "John Smith",
      student_name: "Alice Johnson",
      student_email: "alice@example.com",
      session_date: "2024-01-15T10:00:00Z",
      status: "present",
      duration_minutes: 60,
      joined_at: "2024-01-15T09:58:00Z",
      left_at: "2024-01-15T10:58:00Z"
    },
    {
      id: 2,
      session_id: 101,
      session_title: "React Fundamentals - Session 1",
      tutor_name: "John Smith",
      student_name: "Bob Wilson",
      student_email: "bob@example.com",
      session_date: "2024-01-15T10:00:00Z",
      status: "late",
      duration_minutes: 45,
      joined_at: "2024-01-15T10:15:00Z",
      left_at: "2024-01-15T11:00:00Z"
    },
    {
      id: 3,
      session_id: 102,
      session_title: "Advanced JavaScript Patterns",
      tutor_name: "Sarah Chen",
      student_name: "Carol Davis",
      student_email: "carol@example.com",
      session_date: "2024-01-16T14:00:00Z",
      status: "absent",
      duration_minutes: 0
    },
    {
      id: 4,
      session_id: 103,
      session_title: "Python for Data Science",
      tutor_name: "Mike Rodriguez",
      student_name: "David Brown",
      student_email: "david@example.com",
      session_date: "2024-01-17T16:00:00Z",
      status: "present",
      duration_minutes: 90,
      joined_at: "2024-01-17T15:55:00Z",
      left_at: "2024-01-17T17:25:00Z"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />;
      case 'late':
        return <Clock className="w-4 h-4 text-orange-500 dark:text-orange-400" />;
      case 'excused':
        return <CheckCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      present: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
      absent: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
      late: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
      excused: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
    };
    
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredData = attendanceData.filter(record => {
    const matchesSearch = 
      record.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.tutor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.session_title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = !dateFilter || record.session_date.startsWith(dateFilter);
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesDate && matchesStatus;
  });

  const exportToCSV = () => {
    // CSV export logic would go here
    console.log('Exporting attendance data...');
  };

  const stats = {
    total: filteredData.length,
    present: filteredData.filter(r => r.status === 'present').length,
    absent: filteredData.filter(r => r.status === 'absent').length,
    late: filteredData.filter(r => r.status === 'late').length,
    excused: filteredData.filter(r => r.status === 'excused').length
  };

  const attendanceRate = stats.total > 0 ? Math.round((stats.present + stats.excused) / stats.total * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Attendance Tracking</h2>
          <p className="text-muted-foreground">Monitor and verify attendance records across all sessions</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              className="flex-1 sm:flex-none bg-card hover:bg-accent border-border"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            className="flex-1 sm:flex-none bg-card hover:bg-accent border-border"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Records</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.present}</div>
            <div className="text-sm text-muted-foreground">Present</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.absent}</div>
            <div className="text-sm text-muted-foreground">Absent</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.late}</div>
            <div className="text-sm text-muted-foreground">Late</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.excused}</div>
            <div className="text-sm text-muted-foreground">Excused</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{attendanceRate}%</div>
            <div className="text-sm text-muted-foreground">Attendance Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="date-filter">Date Filter</Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="status-filter">Status Filter</Label>
              <select
                id="status-filter"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDateFilter('');
                  setStatusFilter('all');
                }}
                className="bg-card hover:bg-accent border-border"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results Info */}
      {(searchQuery || dateFilter || statusFilter !== 'all') && (
        <div className="text-sm text-muted-foreground bg-card border border-border rounded-lg p-3">
          Showing {filteredData.length} record{filteredData.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
          {dateFilter && ` on ${new Date(dateFilter).toLocaleDateString()}`}
          {statusFilter !== 'all' && ` with status "${statusFilter}"`}
        </div>
      )}

      {/* Attendance Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Attendance Records</CardTitle>
          <CardDescription>
            Detailed view of all session attendance records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground">Session</TableHead>
                <TableHead className="text-foreground">Tutor</TableHead>
                <TableHead className="text-foreground">Student</TableHead>
                <TableHead className="text-foreground">Date & Time</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground">Duration</TableHead>
                <TableHead className="text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => (
                <TableRow key={record.id} className="border-border hover:bg-accent/50">
                  <TableCell className="font-medium">
                    <div className="max-w-[200px] truncate text-foreground" title={record.session_title}>
                      {record.session_title}
                    </div>
                    <div className="text-xs text-muted-foreground">#{record.session_id}</div>
                  </TableCell>
                  <TableCell className="text-foreground">{record.tutor_name}</TableCell>
                  <TableCell>
                    <div className="text-foreground">{record.student_name}</div>
                    <div className="text-xs text-muted-foreground">{record.student_email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-foreground">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {formatDate(record.session_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusBadge(record.status)} flex items-center gap-1 w-20 justify-center`}
                    >
                      {getStatusIcon(record.status)}
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.duration_minutes > 0 ? (
                      <span className="text-sm text-foreground">{record.duration_minutes} min</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // View details logic
                        console.log('View attendance details:', record.id);
                      }}
                      className="bg-card hover:bg-accent border-border"
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <div className="text-foreground mb-2">No attendance records found</div>
              <div className="text-sm">Try adjusting your filters or search terms</div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setDateFilter('');
                  setStatusFilter('all');
                }}
                className="mt-4 bg-card hover:bg-accent border-border"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {filteredData.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="text-muted-foreground">
                Showing {filteredData.length} attendance record{filteredData.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">
                    Overall Attendance: {attendanceRate}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-muted-foreground">
                    {Math.round(stats.present / filteredData.length * 100)}% Present
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

// Label component for the attendance tab
function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground mb-1">
      {children}
    </label>
  );
}