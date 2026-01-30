import { Link } from "react-router-dom";
import { Search, BookOpen, Menu, LayoutDashboard, User, LogOut, X, Home, GraduationCap, FolderOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    setMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    
    switch (user.role) {
      case 'student':
        return "/student";
      case 'tutor':
        return "/tutor";
      case 'admin':
      case 'super_admin':
        return "/admin";
      case 'staff':
        return "/staff";
      default:
        return "/";
    }
  };

  const getDashboardName = () => {
    if (!user) return "Dashboard";
    
    switch (user.role) {
      case 'student':
        return "Student Dashboard";
      case 'tutor':
        return "Tutor Dashboard";
      case 'admin':
        return "Admin Dashboard";
      case 'super_admin':
        return "Super Admin";
      case 'staff':
        return "Staff Dashboard";
      default:
        return "Dashboard";
    }
  };

  // Mobile navigation items
  const mobileNavItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: GraduationCap, label: "Courses", href: "/courses" },
    { icon: FolderOpen, label: "Categories", href: "/categories" },
    { icon: Users, label: "About", href: "/about" },
  ];

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-elegant">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                TutorialHub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/courses" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Courses
              </Link>
              <Link to="/categories" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Categories
              </Link>
              <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                About
              </Link>
              
              {/* Dashboard link for logged-in users */}
              {isAuthenticated && (
                <Link 
                  to={getDashboardLink()} 
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {getDashboardName()}
                </Link>
              )}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tutorials..."
                  className="pl-9 w-64 bg-background"
                />
              </div>

              {/* Dark Mode Toggle */}
              <DarkModeToggle />

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    <User className="h-4 w-4" />
                    <span>{user?.name}</span>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {user?.role}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-foreground">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="default" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6 text-foreground" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          
          {/* Sidebar Panel */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-card border-l border-border shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-lg font-bold text-foreground">TutorialHub</span>
                  <p className="text-sm text-muted-foreground">Navigation</p>
                </div>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tutorials..."
                  className="pl-9 bg-background w-full"
                />
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                >
                  <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                  <span className="text-foreground font-medium">{item.label}</span>
                </Link>
              ))}

              {/* Dashboard Link for Authenticated Users */}
              {isAuthenticated && (
                <Link
                  to={getDashboardLink()}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group border border-border"
                >
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <div>
                    <span className="text-foreground font-medium block">{getDashboardName()}</span>
                    <span className="text-xs text-muted-foreground">Go to your dashboard</span>
                  </div>
                </Link>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border space-y-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm font-medium text-foreground">Theme</span>
                <DarkModeToggle />
              </div>

              {/* User Section */}
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/20">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={closeMobileMenu}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu}>
                    <Button variant="default" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;