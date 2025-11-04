import { Link } from "react-router-dom";
import { BookOpen, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-elegant">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-primary bg-clip-text text-transparent">
                TutorialHub
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering learners worldwide with expert tutorials and professional courses.
            </p>
            <div className="flex gap-3">
              <a href="#" className="h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Learn</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/tutorials" className="hover:text-primary transition-colors">
                  All Tutorials
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-primary transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Learning Paths
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Certificates
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TutorialHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
