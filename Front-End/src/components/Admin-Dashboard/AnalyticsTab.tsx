// components/admin-dashboard/AnalyticsTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface Metric {
  metric: string;
  value: number;
  target: number;
  trend: "up" | "down";
}

interface AnalyticsTabProps {
  analytics: Metric[];
}

export default function AnalyticsTab({ analytics }: AnalyticsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Platform Growth</CardTitle>
          <CardDescription>User acquisition and engagement trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Placeholder for chart */}
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-12 h-12 text-gray-400" />
              <span className="ml-2 text-gray-500">Growth Chart</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key platform performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analytics.map((metric, index) => (
              <MetricItem key={index} metric={metric} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricItem({ metric }: { metric: Metric }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${
          metric.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="font-medium text-gray-700">{metric.metric}</span>
      </div>
      <div className="text-right">
        <span className="font-bold text-gray-900">
          {metric.value % 1 !== 0 ? metric.value.toFixed(1) : metric.value}%
        </span>
        <div className={`text-xs ${metric.value >= metric.target ? 'text-green-600' : 'text-red-600'}`}>
          vs {metric.target}% target
        </div>
      </div>
    </div>
  );
}