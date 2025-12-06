// src/components/SuperAdmin-Dashboard/SystemControlTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Server, Cpu, Shield, RefreshCw, Power,
  AlertTriangle, CheckCircle, XCircle, Settings,
  Database, Network, Clock, Zap
} from "lucide-react";

interface SystemControlTabProps {
  onSystemAction: (action: string, data?: any) => void;
  systemHealth?: 'healthy' | 'warning' | 'critical';
}

export default function SystemControlTab({ onSystemAction, systemHealth = 'healthy' }: SystemControlTabProps) {
  const systemMetrics = [
    { name: 'CPU Usage', value: 45, max: 100, status: 'normal' },
    { name: 'Memory Usage', value: 68, max: 100, status: 'warning' },
    { name: 'Disk Space', value: 82, max: 100, status: 'warning' },
    { name: 'Network I/O', value: 23, max: 100, status: 'normal' },
    { name: 'Database Connections', value: 12, max: 50, status: 'normal' },
    { name: 'Active Sessions', value: 147, max: 500, status: 'normal' }
  ];

  const systemSettings = [
    { id: 'maintenance_mode', name: 'Maintenance Mode', description: 'Put system in maintenance mode', enabled: false },
    { id: 'debug_mode', name: 'Debug Mode', description: 'Enable detailed logging and debugging', enabled: true },
    { id: 'api_rate_limiting', name: 'API Rate Limiting', description: 'Limit API requests per user', enabled: true },
    { id: 'auto_backup', name: 'Auto Backup', description: 'Automatically backup database', enabled: true },
    { id: 'error_reporting', name: 'Error Reporting', description: 'Send error reports to admin', enabled: false },
    { id: 'performance_monitoring', name: 'Performance Monitoring', description: 'Monitor system performance', enabled: true }
  ];

  const criticalActions = [
    {
      id: 'clear_cache',
      name: 'Clear System Cache',
      description: 'Clear all cached data and temporary files',
      icon: RefreshCw,
      color: 'bg-blue-100 text-blue-600',
      action: 'clear_cache'
    },
    {
      id: 'restart_services',
      name: 'Restart Services',
      description: 'Restart all background services',
      icon: Power,
      color: 'bg-orange-100 text-orange-600',
      action: 'restart_services'
    },
    {
      id: 'run_backup',
      name: 'Run Backup',
      description: 'Create immediate system backup',
      icon: Database,
      color: 'bg-green-100 text-green-600',
      action: 'run_backup'
    },
    {
      id: 'security_scan',
      name: 'Security Scan',
      description: 'Run comprehensive security check',
      icon: Shield,
      color: 'bg-red-100 text-red-600',
      action: 'security_scan'
    }
  ];

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMetricColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSystemAction = (action: string) => {
    onSystemAction(action);
  };

  const handleSettingToggle = (settingId: string, enabled: boolean) => {
    onSystemAction('toggle_setting', { settingId, enabled });
  };

  return (
    <div className="space-y-6">
      {/* System Status Header */}
      <Card className={`border-l-4 ${
        systemHealth === 'healthy' ? 'border-l-green-500' :
        systemHealth === 'warning' ? 'border-l-yellow-500' :
        'border-l-red-500'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${getHealthColor(systemHealth)}`}>
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">System Status: {systemHealth.toUpperCase()}</h3>
                <p className="text-gray-600">
                  {systemHealth === 'healthy' 
                    ? 'All systems operational and running smoothly' 
                    : systemHealth === 'warning'
                    ? 'Some systems require attention - check metrics below'
                    : 'Critical issues detected - immediate action required'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-xl font-bold">99.8%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
          <CardDescription>Real-time system performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{metric.name}</h4>
                    <p className="text-2xl font-bold">{metric.value}%</p>
                  </div>
                  <Badge variant={
                    metric.status === 'normal' ? 'secondary' :
                    metric.status === 'warning' ? 'outline' : 'destructive'
                  }>
                    {metric.status}
                  </Badge>
                </div>
                <Progress 
                  value={metric.value} 
                  className={`h-2 ${getMetricColor(metric.value, metric.max)}`}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Max: {metric.max} | Current: {metric.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical System Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Critical System Actions</CardTitle>
          <CardDescription>Administrative actions that affect system operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card key={action.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{action.name}</h4>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSystemAction(action.action)}
                    >
                      Execute Action
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>Manage system-wide settings and features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemSettings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor={setting.id} className="font-medium">
                    {setting.name}
                  </Label>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
                <Switch
                  id={setting.id}
                  checked={setting.enabled}
                  onCheckedChange={(checked) => handleSettingToggle(setting.id, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Logs Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Events</CardTitle>
          <CardDescription>Latest system activities and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '2 minutes ago', event: 'Database backup completed successfully', type: 'success' },
              { time: '15 minutes ago', event: 'User authentication service restarted', type: 'info' },
              { time: '1 hour ago', event: 'Scheduled cache clearance executed', type: 'success' },
              { time: '3 hours ago', event: 'High memory usage detected on server', type: 'warning' },
              { time: '5 hours ago', event: 'Security scan completed - no threats found', type: 'success' }
            ].map((log, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded">
                {log.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : log.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Clock className="w-4 h-4 text-blue-500" />
                )}
                <div className="flex-1">
                  <p className="text-sm">{log.event}</p>
                  <p className="text-xs text-gray-500">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View Full System Logs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}