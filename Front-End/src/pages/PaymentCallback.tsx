// src/pages/PaymentCallback.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { verifyPayment } from '@/services/paymentService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Home,
  BookOpen,
  CreditCard,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface PaymentVerificationData {
  payment: {
    id: number;
    amount: number;
    currency: string;
    status: string;
    chapa_reference: string;
    payment_method: string;
    completed_at: string | null;
    created_at: string;
  };
  tutorial: {
    id: number;
    title: string;
    description: string;
    image: string;
  };
  enrollment: {
    id: number;
    status: string;
    activated_at: string | null;
  };
}

const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [verificationStatus, setVerificationStatus] = useState<
    'loading' | 'success' | 'failed' | 'pending' | 'unknown'
  >('loading');
  const [paymentData, setPaymentData] = useState<PaymentVerificationData | null>(null);
  const [tutorialDetails, setTutorialDetails] = useState<any>(null);
  const [retrying, setRetrying] = useState(false);
  const [autoRedirectTimer, setAutoRedirectTimer] = useState(10);

  useEffect(() => {
    const verifyPaymentAndProcess = async () => {
      const txRef = searchParams.get('tx_ref');
      const status = searchParams.get('status');
      const tutorialId = searchParams.get('tutorial');

      console.log('Payment callback parameters:', { txRef, status, tutorialId });

      if (!txRef) {
        setVerificationStatus('failed');
        toast({
          title: 'Missing Payment Reference',
          description: 'No payment reference found in URL.',
          variant: 'destructive',
        });
        return;
      }

      try {
        // Step 1: Verify payment with backend
        const response = await verifyPayment(txRef);
        console.log('Payment verification response:', response);

        if (response.success && response.data.payment) {
          const { payment, tutorial, enrollment } = response.data;
          setPaymentData(response.data);

          // Determine status
          if (payment.status === 'completed') {
            setVerificationStatus('success');
            
            // Success toast
            toast({
              title: 'Payment Successful!',
              description: `You have been enrolled in "${tutorial.title}"`,
              variant: 'default',
            });

            // Fetch tutorial details for better UI
            if (tutorialId) {
              try {
                const tutorialResponse = await apiClient.get(`/tutorials/${tutorialId}`);
                if (tutorialResponse.data.success) {
                  setTutorialDetails(tutorialResponse.data.tutorial);
                }
              } catch (error) {
                console.error('Failed to fetch tutorial details:', error);
              }
            }

            // Start auto-redirect timer
            startAutoRedirectTimer();

          } else if (payment.status === 'pending') {
            setVerificationStatus('pending');
            toast({
              title: 'Payment Processing',
              description: 'Your payment is being processed. This may take a few minutes.',
              variant: 'default',
            });
          } else if (payment.status === 'failed') {
            setVerificationStatus('failed');
            toast({
              title: 'Payment Failed',
              description: 'Your payment could not be processed. Please try again.',
              variant: 'destructive',
            });
          } else {
            setVerificationStatus('unknown');
          }

        } else {
          throw new Error(response.message || 'Payment verification failed');
        }

      } catch (error: any) {
        console.error('Payment verification error:', error);
        
        // Check if it's a network error or server error
        if (error.response?.status === 404) {
          // Payment not found yet (might be pending)
          setVerificationStatus('pending');
          toast({
            title: 'Payment Processing',
            description: 'Your payment is being verified. Please check back in a few minutes.',
            variant: 'default',
          });
        } else {
          setVerificationStatus('failed');
          
          const errorMessage = error.response?.data?.message || 
                             error.message || 
                             'Unable to verify payment status';
          
          toast({
            title: 'Verification Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      }
    };

    verifyPaymentAndProcess();
  }, [searchParams, toast]);

  const startAutoRedirectTimer = () => {
    const timer = setInterval(() => {
      setAutoRedirectTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleContinueLearning();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const handleContinueLearning = () => {
    if (paymentData?.tutorial?.id) {
      navigate(`/student/learn/${paymentData.tutorial.id}`);
    } else {
      navigate('/student');
    }
  };

  const handleRetryVerification = async () => {
    const txRef = searchParams.get('tx_ref');
    if (!txRef) return;

    setRetrying(true);
    try {
      const response = await verifyPayment(txRef);
      
      if (response.success && response.data.payment.status === 'completed') {
        setPaymentData(response.data);
        setVerificationStatus('success');
        
        toast({
          title: 'Payment Verified!',
          description: 'Your payment has been confirmed successfully.',
          variant: 'default',
        });

        startAutoRedirectTimer();
      } else {
        toast({
          title: 'Still Processing',
          description: 'Payment is still being processed. Please try again in a few minutes.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Retry verification error:', error);
      toast({
        title: 'Verification Failed',
        description: 'Unable to verify payment. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setRetrying(false);
    }
  };

  const handleRetryPayment = () => {
    const tutorialId = searchParams.get('tutorial');
    if (tutorialId) {
      navigate(`/tutorial/${tutorialId}`);
    } else {
      navigate('/tutorials');
    }
  };

  const handleGoToDashboard = () => {
    navigate('/student');
  };

  const handleContactSupport = () => {
    // You can implement contact support functionality here
    toast({
      title: 'Contact Support',
      description: 'Please email support@tutorialsystem.com for assistance.',
      variant: 'default',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-16 w-16 text-amber-500" />;
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />;
      default:
        return <AlertCircle className="h-16 w-16 text-gray-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'pending':
        return 'Payment Processing';
      case 'loading':
        return 'Verifying Payment...';
      default:
        return 'Payment Status Unknown';
    }
  };

  const getStatusDescription = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Your payment has been confirmed and you now have access to the tutorial.';
      case 'failed':
        return 'We were unable to process your payment. Please try again or contact support.';
      case 'pending':
        return 'Your payment is being processed. This usually takes a few minutes.';
      case 'loading':
        return 'Please wait while we verify your payment status...';
      default:
        return 'Unable to determine payment status. Please contact support.';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Card className="shadow-lg border-2">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold">
              {getStatusTitle()}
            </CardTitle>
            <p className="text-muted-foreground">
              {getStatusDescription()}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Auto-redirect message for success */}
            {verificationStatus === 'success' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <p className="text-green-700 dark:text-green-300">
                  Redirecting to tutorial in {autoRedirectTimer} seconds...
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setAutoRedirectTimer(0)}
                  className="mt-2 text-green-600 hover:text-green-800"
                >
                  Skip and go now
                </Button>
              </div>
            )}

            {/* Payment Details */}
            {paymentData && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold">
                        {paymentData.payment.amount} {paymentData.payment.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge 
                        variant={
                          paymentData.payment.status === 'completed' ? 'default' :
                          paymentData.payment.status === 'pending' ? 'secondary' : 'destructive'
                        }
                        className="ml-2"
                      >
                        {paymentData.payment.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reference:</span>
                      <span className="font-mono text-sm">
                        {paymentData.payment.chapa_reference}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{formatDate(paymentData.payment.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="capitalize">{paymentData.payment.payment_method}</span>
                    </div>
                    {paymentData.payment.completed_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completed:</span>
                        <span>{formatDate(paymentData.payment.completed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Tutorial Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tutorial Information</h3>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    {tutorialDetails?.image ? (
                      <img 
                        src={tutorialDetails.image} 
                        alt={paymentData.tutorial.title}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">{paymentData.tutorial.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {paymentData.tutorial.description}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {paymentData.enrollment.status === 'active' ? 'Active' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Pending payment instructions */}
            {verificationStatus === 'pending' && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300">
                      What happens next?
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-400">
                      <li>• Payment processing usually takes 2-5 minutes</li>
                      <li>• You will receive an email confirmation</li>
                      <li>• Tutorial access will be activated automatically</li>
                      <li>• Check your dashboard for updates</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Failed payment help */}
            {verificationStatus === 'failed' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-300">
                      Need help?
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-400">
                      <li>• Check your payment method details</li>
                      <li>• Ensure sufficient funds are available</li>
                      <li>• Contact your bank if needed</li>
                      <li>• Try a different payment method</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {/* Action buttons based on status */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {verificationStatus === 'success' && (
                <>
                  <Button
                    onClick={handleContinueLearning}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Start Learning
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGoToDashboard}
                    className="flex-1"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </>
              )}

              {verificationStatus === 'failed' && (
                <>
                  <Button
                    onClick={handleRetryPayment}
                    variant="default"
                    className="flex-1"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleContactSupport}
                    className="flex-1"
                  >
                    Contact Support
                  </Button>
                </>
              )}

              {verificationStatus === 'pending' && (
                <>
                  <Button
                    onClick={handleRetryVerification}
                    disabled={retrying}
                    className="flex-1"
                  >
                    {retrying ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    {retrying ? 'Checking...' : 'Check Status'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGoToDashboard}
                    className="flex-1"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </>
              )}

              {verificationStatus === 'loading' && (
                <Button disabled className="w-full">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </Button>
              )}

              {verificationStatus === 'unknown' && (
                <>
                  <Button
                    onClick={handleRetryVerification}
                    className="flex-1"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Verification
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleContactSupport}
                    className="flex-1"
                  >
                    Contact Support
                  </Button>
                </>
              )}
            </div>

            {/* Additional actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => navigate('/tutorials')}
                className="flex-1"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Browse More Tutorials
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/student')}
                className="flex-1"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Payment History
              </Button>
            </div>

            {/* Help text */}
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Need assistance?{' '}
                <button
                  onClick={handleContactSupport}
                  className="text-primary hover:underline"
                >
                  Contact our support team
                </button>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Payment reference: {searchParams.get('tx_ref') || 'Not available'}
              </p>
            </div>
          </CardFooter>
        </Card>

        {/* Additional information section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold">Access Your Tutorial</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Once payment is confirmed, your tutorial will appear in "My Tutorials" on your dashboard.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold">Receipt & Records</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Find payment receipts and transaction history in the "Payment History" section.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h4 className="font-semibold">Need Help?</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                For payment issues or questions, contact our support team at support@tutorialsystem.com
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCallbackPage;