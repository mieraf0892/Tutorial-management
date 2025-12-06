// src/components/SuperAdmin-Dashboard/FinanceOversightTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign, CheckCircle, XCircle, Clock, Download,
  TrendingUp, Users, FileText, BarChart3
} from "lucide-react";

interface FinancialReport {
  id: number;
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: string;
  submitted_at: string;
}

interface FinanceOversightTabProps {
  reports: FinancialReport[];
  onApproveReport: (action: string, data: any) => void;
  stats: any;
}

export default function FinanceOversightTab({ reports, onApproveReport, stats }: FinanceOversightTabProps) {
  const financialStats = stats || {
    total_revenue: 0,
    pending_payouts: 0,
    net_profit: 0
  };

  const handleApproveReport = (reportId: number) => {
    onApproveReport('approve_financial_report', { reportId });
  };

  const handleRejectReport = (reportId: number) => {
    onApproveReport('reject_financial_report', { reportId });
  };

  const handleExportFinancials = (type: string) => {
    onApproveReport('export_financials', { type });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Financial Oversight</h2>
          <p className="text-gray-600">Approve financial reports and manage payouts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportFinancials('reports')}>
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
          <Button variant="outline" onClick={() => handleExportFinancials('payouts')}>
            <DollarSign className="w-4 h-4 mr-2" />
            Payout Management
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${financialStats.total_revenue?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${financialStats.pending_payouts?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${financialStats.net_profit?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">This period</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Financial Reports</CardTitle>
          <CardDescription>
            {reports.filter(r => r.status === 'pending').length} reports awaiting approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.filter(r => r.status === 'pending').map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{report.period} Financial Report</h3>
                    <p className="text-sm text-gray-600">
                      Submitted by {report.submitted_by} • {new Date(report.submitted_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm">Revenue: <strong>${report.revenue.toLocaleString()}</strong></span>
                      <span className="text-sm">Expenses: <strong>${report.expenses.toLocaleString()}</strong></span>
                      <span className="text-sm">Profit: <strong className="text-green-600">${report.profit.toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getStatusBadge(report.status)}
                  <Button
                    size="sm"
                    onClick={() => handleApproveReport(report.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRejectReport(report.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}

            {reports.filter(r => r.status === 'pending').length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                <p className="text-gray-600">No pending financial reports at this time.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Approval Statistics</CardTitle>
            <CardDescription>Report approval metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Approval Rate</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Processing Time</span>
                <span>2.3 days</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Monthly Reports</span>
                <span>12</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Financial management tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Revenue Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Process Tutor Payouts
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Tax Documentation
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export All Financial Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}