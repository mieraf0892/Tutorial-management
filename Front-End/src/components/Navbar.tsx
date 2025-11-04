import { Link } from "react-router-dom";
import { Search, BookOpen, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-elegant">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-primary bg-clip-text text-transparent">
              TutorialHub
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/tutorials" className="text-sm font-medium hover:text-primary transition-colors">
              Tutorials
            </Link>
            <Link to="/categories" className="text-sm font-medium hover:text-primary transition-colors">
              Categories
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tutorials..."
                className="pl-9 w-64"
              />
            </div>
            <Link to="/login">
              <Button variant="default" size="sm">
                Get Started
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            <Link to="/" className="block py-2 hover:text-primary">
              Home
            </Link>
            <Link to="/tutorials" className="block py-2 hover:text-primary">
              Tutorials
            </Link>
            <Link to="/categories" className="block py-2 hover:text-primary">
              Categories
            </Link>
            <Link to="/about" className="block py-2 hover:text-primary">
              About
            </Link>
            <Input
              type="search"
              placeholder="Search tutorials..."
              className="w-full"
            />
            <Link to="/login" className="block">
              <Button variant="default" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
