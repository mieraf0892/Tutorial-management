import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initiatePayment, checkEnrollmentStatus, type TutorialEnrollmentStatus } from '@/services/paymentService';
import { useNavigate } from 'react-router-dom';

interface PaymentButtonProps {
  tutorialId: number;
  price: number;
  tutorialTitle: string;
  tutorialSlug?: string;
  isFree?: boolean;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  tutorialId,
  price,
  tutorialTitle,
  tutorialSlug,
  isFree = false,
  className = '',
  size = 'default',
  variant = 'default',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<TutorialEnrollmentStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check enrollment status on mount
  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        setIsChecking(true);
        const status = await checkEnrollmentStatus(tutorialId);
        setEnrollmentStatus(status);
      } catch (error) {
        console.error('Failed to check enrollment status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkStatus();
  }, [tutorialId]);

  const handleEnroll = async () => {
    if (isFree) {
      // Handle free tutorial enrollment
      try {
        setIsLoading(true);
        const status = await checkEnrollmentStatus(tutorialId);
        
        if (status.is_enrolled) {
          toast({
            title: "Already Enrolled",
            description: "You are already enrolled in this tutorial.",
            variant: "default",
          });
          navigate(`/student/learn/${tutorialId}`);
        }
      } catch (error: any) {
        console.error('Enrollment error:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to enroll. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Handle paid tutorial
    setIsLoading(true);
    try {
      const frontendUrl = window.location.origin;
      const returnUrl = `${frontendUrl}/payment/callback?tutorial=${tutorialId}${tutorialSlug ? `&slug=${tutorialSlug}` : ''}`;
      
      const response = await initiatePayment(tutorialId, returnUrl);
      
      if (response.success && response.data.checkout_url) {
        // Redirect to Chapa checkout
        window.location.href = response.data.checkout_url;
      } else {
        toast({
          title: "Payment Failed",
          description: response.message || "Unable to initialize payment",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      
      let errorMessage = "Failed to process payment. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumePayment = () => {
    if (enrollmentStatus?.payment_reference) {
      // For pending payments, we can redirect to a retry page
      navigate(`/payment/retry/${enrollmentStatus.payment_reference}`);
    }
  };

  const handleContinueLearning = () => {
    if (enrollmentStatus?.enrollment_id) {
      navigate(`/student/learn/${tutorialId}`);
    }
  };

  // Show loading state while checking
  if (isChecking) {
    return (
      <Button disabled className={`w-full ${className}`} size={size} variant={variant}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  // Already enrolled and active
  if (enrollmentStatus?.is_enrolled && enrollmentStatus.enrollment_status === 'active') {
    return (
      <Button
        onClick={handleContinueLearning}
        className={`w-full bg-green-600 hover:bg-green-700 ${className}`}
        size={size}
        variant={variant}
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Continue Learning
      </Button>
    );
  }

  // Pending payment
  if (enrollmentStatus?.is_enrolled && enrollmentStatus.payment_status === 'pending') {
    return (
      <div className="space-y-2 w-full">
        <Button
          onClick={handleResumePayment}
          className={`w-full bg-amber-600 hover:bg-amber-700 ${className}`}
          size={size}
          variant={variant}
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          Complete Payment
        </Button>
        <p className="text-xs text-amber-600 text-center">
          You have a pending payment for this tutorial
        </p>
      </div>
    );
  }

  // Free tutorial
  if (isFree) {
    return (
      <Button
        onClick={handleEnroll}
        disabled={isLoading}
        className={`w-full bg-blue-600 hover:bg-blue-700 ${className}`}
        size={size}
        variant={variant}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enrolling...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Enroll for Free
          </>
        )}
      </Button>
    );
  }

  // Paid tutorial - show payment button
  return (
    <Button
      onClick={handleEnroll}
      disabled={isLoading}
      className={`w-full bg-green-600 hover:bg-green-700 ${className}`}
      size={size}
      variant={variant}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Lock className="mr-2 h-4 w-4" />
          Enroll Now - {price.toLocaleString()} ETB
        </>
      )}
    </Button>
  );
};

export default PaymentButton;