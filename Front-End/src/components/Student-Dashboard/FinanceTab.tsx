interface FinanceTabProps {
  paymentHistory: PaymentHistory[];
  stats: Stats;
  onMakePayment: (tutorialId: number) => void;
}

export default function FinanceTab({ paymentHistory, stats, onMakePayment }: FinanceTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground">Total Spent</h3>
          <p className="text-2xl font-bold text-foreground">${stats.total_paid}</p>
          <p className="text-sm text-muted-foreground mt-1">All-time payments</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground">Active Subscriptions</h3>
          <p className="text-2xl font-bold text-foreground">{stats.total_enrolled}</p>
          <p className="text-sm text-muted-foreground mt-1">Current tutorials</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground">Upcoming Payments</h3>
          <p className="text-2xl font-bold text-foreground">0</p>
          <p className="text-sm text-muted-foreground mt-1">Scheduled payments</p>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Payment History</h2>
          <p className="text-sm text-muted-foreground mt-1">Your recent transactions and payments</p>
        </div>
        <div className="p-6">
          {paymentHistory.length > 0 ? (
            <div className="space-y-4">
              {paymentHistory.map(payment => (
                <div key={payment.id} className="flex justify-between items-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{payment.description}</p>
                    {payment.tutorial_title && (
                      <p className="text-sm text-muted-foreground mt-1">{payment.tutorial_title}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(payment.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-lg ${getStatusColor(payment.status)}`}>
                      ${payment.amount} {payment.currency}
                    </p>
                    <p className={`text-sm capitalize px-2 py-1 rounded-full inline-block mt-1 ${
                      payment.status === 'completed' 
                        ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400' 
                        : payment.status === 'pending' 
                        ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400'
                        : 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400'
                    }`}>
                      {payment.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No payment history</h3>
              <p className="text-muted-foreground">Your payment records will appear here after making payments.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => onMakePayment(0)} // You might want to handle this differently
              className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Make a Payment</h3>
                  <p className="text-sm text-muted-foreground">Pay for new tutorials or subscriptions</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => {/* Handle invoice download */}}
              className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Download Invoices</h3>
                  <p className="text-sm text-muted-foreground">Get copies of your payment receipts</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}