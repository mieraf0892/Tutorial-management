import { Button } from "@/components/ui/button";
import { BookOpen, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface DashboardNavbarProps {
  userRole?: "student" | "tutor" | "admin" | "super_admin";
  onLogout?: () => void;
}

export const DashboardNavbar = ({ userRole, onLogout }: DashboardNavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate("/login");
  };

  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-elegant">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-primary bg-clip-text text-transparent">
              TutorialHub
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {userRole && (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium capitalize text-foreground">
                    {userRole}
                  </span>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut 
                  className="w-4 h-4" 
                  onClick={onLogout}
                  />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
