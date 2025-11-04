import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";

const Hero = () => {

  const handleDemo = () => {
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-soft">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 relative z-30">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                🎓 Professional Learning Platform
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Master New Skills with
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Expert Tutorials</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Access thousands of high-quality tutorials across programming, design, business, and more. 
              Learn at your own pace from industry experts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative z-30 w-full max-w-2xl">
              {/* Primary CTA - Get Started Free */}
                <Button variant="default" size="lg" asChild className="flex-1 min-w-[140px] justify-center">
                <Link to="/register" className="flex items-center justify-center">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                </Button>
                
                {/* Tertiary CTA - Watch Demo */}
                <Button 
                variant="ghost" 
                size="lg" 
                onClick={handleDemo}
                className="flex-1 min-w-[140px] justify-center"
                >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
                </Button>
            </div>

            <div className="pt-2">
              <span className="text-sm text-muted-foreground">
                Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
              </span>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">1,200+</div>
                <div className="text-sm text-muted-foreground">Tutorials</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-primary opacity-20 blur-3xl rounded-full" />
            <img
              src={heroBanner}
              alt="Professional learning environment"
              className="relative rounded-2xl shadow-elegant hover-lift"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
