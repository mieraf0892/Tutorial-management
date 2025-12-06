// components/admin-dashboard/AnalyticsTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, TrendingDown, Users, BookOpen, Clock, Download, Calendar, Target } from "lucide-react";
import { useState } from "react";

interface Metric {
  metric: string;
  value: number;
  target: number;
  trend: "up" | "down";
  change?: number;
  description?: string;
}

interface AnalyticsTabProps {
  analytics: Metric[];
}

export default function AnalyticsTab({ analytics }: AnalyticsTabProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  // Default analytics data if none provided
  const defaultAnalytics: Metric[] = [
    {
      metric: "User Engagement",
      value: 78,
      target: 75,
      trend: "up",
      change: 5,
      description: "Average time spent on platform"
    },
    {
      metric: "Course Completion",
      value: 65,
      target: 70,
      trend: "down",
      change: 2,
      description: "Percentage of completed courses"
    },
    {
      metric: "Tutor Performance",
      value: 92,
      target: 85,
      trend: "up",
      change: 8,
      description: "Average tutor satisfaction rating"
    },
    {
      metric: "Revenue Growth",
      value: 45,
      target: 40,
      trend: "up",
      change: 12,
      description: "Monthly recurring revenue increase"
    },
    {
      metric: "Student Retention",
      value: 88,
      target: 90,
      trend: "down",
      change: 3,
      description: "Students continuing after first month"
    }
  ];

  const displayAnalytics = analytics.length > 0 ? analytics : defaultAnalytics;

  const getTrendIcon = (trend: "up" | "down") => {
    return trend === "up" ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getTimeRangeLabel = (range: string) => {
    const labels = {
      week: "Last 7 Days",
      month: "Last 30 Days",
      quarter: "Last 90 Days"
    };
    return labels[range as keyof typeof labels] || range;
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Platform Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into platform performance and growth</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            {(['week', 'month', 'quarter'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs ${
                  timeRange === range 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="bg-card hover:bg-accent border-border">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range Badge */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <Badge variant="outline" className="bg-card border-border">
          {getTimeRangeLabel(timeRange)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Growth Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Platform Growth
            </CardTitle>
            <CardDescription>User acquisition and engagement trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Chart Placeholder with Enhanced Styling */}
              <div className="h-64 bg-muted/30 rounded-lg border border-border flex flex-col items-center justify-center p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">Growth Analytics</span>
                </div>
                <div className="text-center text-muted-foreground text-sm max-w-xs">
                  Interactive chart showing user growth, engagement metrics, and platform performance over time
                </div>
              </div>
              
              {/* Mini Stats under Chart */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="text-lg font-bold text-foreground">1,234</div>
                  <div className="text-xs text-muted-foreground">New Users</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="text-lg font-bold text-foreground">45%</div>
                  <div className="text-xs text-muted-foreground">Growth</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="text-lg font-bold text-foreground">89%</div>
                  <div className="text-xs text-muted-foreground">Retention</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Key platform performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {displayAnalytics.map((metric, index) => (
                <MetricItem key={index} metric={metric} />
              ))}
            </div>
            
            {/* Summary Stats */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="font-semibold text-foreground">
                    {Math.round(displayAnalytics.reduce((acc, m) => acc + m.value, 0) / displayAnalytics.length)}%
                  </div>
                  <div className="text-muted-foreground">Avg. Performance</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="font-semibold text-foreground">
                    {displayAnalytics.filter(m => m.value >= m.target).length}/{displayAnalytics.length}
                  </div>
                  <div className="text-muted-foreground">Targets Met</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2,847</div>
            <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>12% increase</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-green-500" />
              Courses Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,562</div>
            <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>8% increase</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              Avg. Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">24m</div>
            <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
              <TrendingDown className="w-3 h-3" />
              <span>3% decrease</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricItem({ metric }: { metric: Metric }) {
  const progress = Math.min((metric.value / metric.target) * 100, 100);
  
  return (
    <div className="p-4 border border-border rounded-lg hover:bg-accent/30 transition-colors bg-card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${
              metric.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="font-medium text-foreground">{metric.metric}</span>
            {metric.change && (
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  metric.trend === 'up' 
                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' 
                    : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                }`}
              >
                {metric.trend === 'up' ? '+' : ''}{metric.change}%
              </Badge>
            )}
          </div>
          {metric.description && (
            <div className="text-xs text-muted-foreground">{metric.description}</div>
          )}
        </div>
        <div className="text-right">
          <span className="font-bold text-foreground text-lg">
            {metric.value % 1 !== 0 ? metric.value.toFixed(1) : metric.value}%
          </span>
          <div className={`text-xs ${metric.value >= metric.target ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            vs {metric.target}% target
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${
            metric.value >= metric.target 
              ? 'bg-green-500' 
              : 'bg-orange-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}