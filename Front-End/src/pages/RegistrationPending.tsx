// RegistrationPending.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Mail } from "lucide-react";

export default function RegistrationPending() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 30 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 30000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
        <div className="mb-6">
          <div className="relative inline-block">
            <Clock className="w-16 h-16 text-primary animate-pulse" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-foreground">
          Registration Submitted Successfully!
        </h1>
        
        <div className="space-y-4 mb-8 text-muted-foreground">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-left">Your tutor registration has been received.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-left">Our admin team will review your application.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-left">You'll receive an email notification once approved.</p>
          </div>
          
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-sm font-medium">⚠️ Please check your email (and spam folder) for approval notification.</p>
            <p className="text-xs mt-2">Approval usually takes 24-48 hours.</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/login')} 
            variant="outline" 
            className="w-full"
          >
            Return to Login
          </Button>
          
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost" 
            className="w-full"
          >
            Go to Homepage
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-6">
          You'll be redirected to login page in 30 seconds...
        </p>
      </div>
    </div>
  );
}