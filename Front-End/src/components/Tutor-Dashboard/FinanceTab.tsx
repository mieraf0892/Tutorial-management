// components/Tutor-Dashboard/FinanceTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react";

interface Payment {
  id: number;
  amount: number;
  currency: string;
  description: string;
  status: "completed" | "pending" | "failed";
  date: string;
  tutorial_title: string;
}

interface Stats {
  total_earnings: number;
}

interface FinanceTabProps {
  payments: Payment[];
  stats: Stats;
}

export default function FinanceTab({ payments, stats }: FinanceTabProps) {
  const totalEarnings = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingEarnings = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-400';
    }
  };

  const getStatCardColor = (type: string) => {
    switch (type) {
      case "total": return "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400";
      case "balance": return "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400";
      case "pending": return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
      default: return "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400";
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleExportPayments = () => {
    // In real app, this would generate and download a CSV
    console.log("Export payments data");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Finance & Payments</h2>
          <p className="text-muted-foreground">Track your earnings and payment history</p>
        </div>
        <Button variant="outline" onClick={handleExportPayments}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(stats.total_earnings)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4" />
                  All time
                </p>
              </div>
              <div className={`p-3 rounded-lg ${getStatCardColor("total")}`}>
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(totalEarnings)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Ready for withdrawal</p>
              </div>
              <div className={`p-3 rounded-lg ${getStatCardColor("balance")}`}>
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(pendingEarnings)}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Processing payments</p>
              </div>
              <div className={`p-3 rounded-lg ${getStatCardColor("pending")}`}>
                <Calendar className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Payment History</CardTitle>
          <CardDescription>Your recent payments and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <DollarSign className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{payment.description}</h4>
                      <p className="text-sm text-muted-foreground">{payment.tutorial_title}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-lg text-foreground">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No payments yet</h3>
              <p className="text-muted-foreground">Payments will appear here when students enroll in your tutorials</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Withdraw Earnings</CardTitle>
          <CardDescription>Transfer your available balance to your bank account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available for withdrawal</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(totalEarnings)}
              </p>
            </div>
            <Button
              disabled={totalEarnings === 0}
            >
              Withdraw
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Transfers typically take 2-3 business days to process.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}