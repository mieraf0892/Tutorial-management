import { useSearchParams } from 'react-router-dom';

export default function RegistrationPending() {
  const [searchParams] = useSearchParams();
  const verified = searchParams.get('verified') === 'success';
  const role = searchParams.get('role');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md text-center p-8 border rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Thank You for Registering!</h1>
        
        {verified ? (
          <>
            <p className="text-green-600 mb-4">Your email has been verified successfully.</p>
            
            {role === 'tutor' ? (
              <>
                <p className="text-muted-foreground mb-6">
                  Your tutor application is now pending admin review.
                </p>
                <p className="text-sm text-muted-foreground">
                  We'll send you an email once your account is approved (usually within 24-48 hours).
                </p>
              </>
            ) : (
              <p className="text-muted-foreground mb-6">
                Your account is now active. You can start exploring!
              </p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground mb-6">
            Your registration is pending. Please check your email to verify.
          </p>
        )}

        <div className="mt-6">
          <a href="/login" className="text-primary hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
}