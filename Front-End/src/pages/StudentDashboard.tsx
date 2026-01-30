import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import PStudent from "./PStudent"; 
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, ShieldCheck, RefreshCw, Bug } from "lucide-react";
import GuestDashboard from "./GuestDashboard";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  /**
   * 1. Check current payment status and load dashboard if paid
   */
  const checkStatus = async () => {
    try {
      // Calls your new status() method in the controller
      const payRes = await apiClient.get("/student/payment-status");
      const paidStatus = !!payRes.data.is_paid;
      
      setIsPaid(paidStatus);
      setPaymentInfo(payRes.data);

      if (paidStatus) {
        const dashRes = await apiClient.get("/student/dashboard");
        setDashboardData(dashRes.data.dashboard);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 2. Handle the return from Chapa
   * Checks for tx_ref in URL, verifies it, then cleans the URL
   */
  useEffect(() => {
    const handleReturnAndVerify = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tx_ref = urlParams.get('tx_ref');

      if (tx_ref) {
        setLoading(true);
        try {
          console.log("Verifying payment with tx_ref:", tx_ref);
          
          // Trigger the verify method in your Backend
          const verifyRes = await apiClient.get(`/payment/verify/${tx_ref}`);
          
          if (verifyRes.data.success) {
            console.log("Payment verification successful");
            // Show success message
            alert("Payment successful! Redirecting to dashboard...");
          } else {
            console.log("Payment verification failed");
            alert("Payment verification failed. Please contact support.");
          }
          
          // Remove tx_ref from URL for a clean look
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error("Auto-verification failed:", error);
          alert("Payment verification error. Please refresh the page.");
        } finally {
          // Always check status after trying to verify
          await checkStatus();
          setLoading(false);
        }
      } else {
        // No tx_ref in URL, just check status normally
        await checkStatus();
      }
    };

    handleReturnAndVerify();
  }, []);

  /**
   * Fixed handlePayNow function
   */
  const handlePayNow = async () => {
    if (!selectedCourseId) {
      alert("Please select a course first");
      return;
    }

    setIsRedirecting(true);
    
    try {
      // Send the selected course ID to the backend
      const res = await apiClient.post("/payment/initialize", {
        course_id: selectedCourseId
      });
      
      console.log("Payment initialization response:", res.data);
      
      if (res.data.success && res.data.checkout_url) {
        // Redirect to Chapa payment page
        window.location.href = res.data.checkout_url;
      } else {
        alert(res.data.message || "Failed to initialize payment");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      
      // Show detailed error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Payment initialization failed";
      
      alert(`Payment Error: ${errorMessage}`);
    } finally {
      setIsRedirecting(false);
    }
  };

  /**
   * Debug function to test payment flow
   */
  const debugPaymentFlow = async () => {
    console.log("🔍 Payment Flow Debug:", {
      selectedCourseId,
      isPaid,
      paymentInfo,
      finalPrice: paymentInfo?.amount_due,
      hasSelectedCourse: !!selectedCourseId,
      urlParams: window.location.search
    });
    
    // Test payment initialization
    try {
      console.log("Testing payment initialization...");
      const testRes = await apiClient.post("/payment/initialize", {
        course_id: selectedCourseId || "test-course"
      });
      console.log("Payment init response:", testRes.data);
      
      if (testRes.data.success) {
        alert("Payment initialization successful! Ready to redirect.");
        console.log("Checkout URL:", testRes.data.checkout_url);
      } else {
        alert(`Payment init failed: ${testRes.data.message}`);
      }
    } catch (error: any) {
      console.error("Payment test error:", error);
      alert(`Test error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Add debug button component
  const DebugButton = () => (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={debugPaymentFlow}
        className="flex items-center gap-2 shadow-lg bg-yellow-50 hover:bg-yellow-100"
      >
        <Bug className="w-4 h-4" />
        Debug Payment
      </Button>
    </div>
  );

  // --- RENDER STATES ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600 mb-2" />
        <p className="text-sm text-muted-foreground italic">Verifying your account status...</p>
      </div>
    );
  }

  // If paid, show the PStudent dashboard
  if (isPaid) {
    return <PStudent data={dashboardData} />;
  } 
  
  // If not paid, show GuestDashboard with debug button
  return (
    <>
      <GuestDashboard
        paymentInfo={paymentInfo}
        onPaymentInit={handlePayNow}
        onRefresh={checkStatus}
        isRedirecting={isRedirecting}
        onCourseSelect={setSelectedCourseId}
        selectedCourseId={selectedCourseId}
      />
      {/* Debug button - remove in production */}
      <DebugButton />
    </>
  );
}