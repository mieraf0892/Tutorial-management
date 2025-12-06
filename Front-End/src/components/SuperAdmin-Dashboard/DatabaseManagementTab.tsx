// src/components/SuperAdmin-Dashboard/DatabaseManagementTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Database, Download, Upload, Trash2, RefreshCw,
  Shield, Zap, Archive, Search, BarChart3,
  CheckCircle, AlertTriangle, Clock
} from "lucide-react";

interface DatabaseManagementTabProps {
  onDatabaseAction: (action: string, data?: any) => void;
  databaseSize?: string;
}

export default function DatabaseManagementTab({ onDatabaseAction, databaseSize = '2.4 GB' }: DatabaseManagementTabProps) {
  const databaseStats = [
    { name: 'Total Size', value: databaseSize, icon: Database, color: 'text-blue-600' },
    { name: 'Tables', value: '48', icon: BarChart3, color: 'text-green-600' },
    { name: 'Backup Age', value: '2 hours', icon: Clock, color: 'text-orange-600' },
    { name: 'Query Performance', value: 'Excellent', icon: Zap, color: 'text-purple-600' }
  ];

  const backupHistory = [
    { id: 1, name: 'Full System Backup', date: '2024-01-20 02:00', size: '2.1 GB', status: 'completed' },
    { id: 2, name: 'Incremental Backup', date: '2024-01-20 14:00', size: '156 MB', status: 'completed' },
    { id: 3, name: 'Database Export', date: '2024-01-19 22:00', size: '1.8 GB', status: 'completed' },
    { id: 4, name: 'Scheduled Backup', date: '2024-01-19 02:00', size: '2.0 GB', status: 'completed' }
  ];

  const maintenanceTasks = [
    { id: 'optimize_tables', name: 'Optimize Database Tables', description: 'Defragment and optimize all tables', duration: '5-10 minutes' },
    { id: 'clear_logs', name: 'Clear Old Logs', description: 'Remove logs older than 30 days', duration: '2-5 minutes' },
    { id: 'update_indexes', name: 'Update Indexes', description: 'Rebuild database indexes', duration: '10-15 minutes' },
    { id: 'check_integrity', name: 'Check Database Integrity', description: 'Verify database consistency', duration: '15-30 minutes' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleBackupAction = (action: string) => {
    onDatabaseAction(action);
  };

  const handleMaintenanceTask = (taskId: string) => {
    onDatabaseAction('run_maintenance', { taskId });
  };

  const handleQueryExecution = (query: string) => {
    onDatabaseAction('execute_query', { query });
  };

  return (
    <div className="space-y-6">
      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {databaseStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Database Operations</CardTitle>
          <CardDescription>Critical database management actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="h-20 flex-col"
              onClick={() => handleBackupAction('create_backup')}
            >
              <Database className="w-6 h-6 mb-2" />
              Create Backup
            </Button>
            
            <Button 
              variant="outline"
              className="h-20 flex-col"
              onClick={() => handleBackupAction('restore_backup')}
            >
              <Download className="w-6 h-6 mb-2" />
              Restore Backup
            </Button>
            
            <Button 
              variant="outline"
              className="h-20 flex-col"
              onClick={() => handleBackupAction('export_data')}
            >
              <Upload className="w-6 h-6 mb-2" />
              Export Data
            </Button>
            
            <Button 
              variant="outline"
              className="h-20 flex-col"
              onClick={() => handleBackupAction('optimize_db')}
            >
              <Zap className="w-6 h-6 mb-2" />
              Optimize DB
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup Management */}
      <Card>
        <CardHeader>
          <CardTitle>Backup Management</CardTitle>
          <CardDescription>Recent backups and backup history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(backup.status)}
                  <div>
                    <h4 className="font-semibold">{backup.name}</h4>
                    <p className="text-sm text-gray-600">
                      {backup.date} • {backup.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Restore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Tasks</CardTitle>
          <CardDescription>Scheduled and manual database maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maintenanceTasks.map((task) => (
              <Card key={task.id} className="border-2">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{task.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{task.duration}</Badge>
                    <Button 
                      size="sm"
                      onClick={() => handleMaintenanceTask(task.id)}
                    >
                      Run Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SQL Query Interface */}
      <Card>
        <CardHeader>
          <CardTitle>SQL Query Interface</CardTitle>
          <CardDescription>Execute direct database queries (Use with caution)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sql-query">SQL Query</Label>
              <Input 
                id="sql-query"
                placeholder="SELECT * FROM users WHERE..."
                className="font-mono mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => handleQueryExecution('SELECT * FROM users LIMIT 10')}
              >
                <Search className="w-4 h-4 mr-2" />
                Test Query
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const query = (document.getElementById('sql-query') as HTMLInputElement)?.value;
                  if (query) handleQueryExecution(query);
                }}
              >
                Execute
              </Button>
              <Button variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Safe Mode
              </Button>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
              <p className="text-sm text-gray-600">
                <strong>Safety Note:</strong> Direct database queries can affect system stability. 
                Always test queries in a development environment first.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Analysis</CardTitle>
          <CardDescription>Database storage distribution and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { table: 'users', size: '245 MB', percentage: 12 },
              { table: 'courses', size: '890 MB', percentage: 44 },
              { table: 'enrollments', size: '320 MB', percentage: 16 },
              { table: 'payments', size: '185 MB', percentage: 9 },
              { table: 'logs', size: '210 MB', percentage: 10 },
              { table: 'other', size: '150 MB', percentage: 7 }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.table}</span>
                  <span>{item.size} ({item.percentage}%)</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}