import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/student';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if(redirectUrl){
        navigate(redirectUrl);
      } else {
        // Role-based redirect as fallback
        if (data.user.role === 'student') {
            navigate('/student');
        } else if (data.user.role === 'tutor') {
            navigate('/tutor');
        } else if (data.user.role === 'admin') {
            navigate('/admin');
        }
      }

      if (response.ok && data.success) {
        // Save token to localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({
          title: "Success",
          description: data.message,
        });

        // Redirect based on role
      if (data.user.role === 'student') {
        navigate('/student');
      } else if (data.user.role === 'tutor') {
        navigate('/tutor');
      } else if (data.user.role === 'admin') {
        navigate('/admin');
      }
        
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Cannot connect to server",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-elegant p-8 border border-border">
            <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                   onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              variant="default">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline font-semibold">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
