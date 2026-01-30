// src/App.tsx
import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import { DarkModeProvider } from '@/contexts/DarkModeProvider';

import Home from "./pages/Home";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Tutor from "./pages/TutorDashboard";
import Student from "./pages/StudentDashboard";
import Admin from "./pages/AdminDashboard";
import SuperAdmin from "./pages/SuperAdminDashboard";
import Login from "./pages/Login";
import PaymentCallback from "./pages/PaymentCallback";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import TutorProfilePage from "./pages/TutorProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentProfile from "./pages/StudentProfilePage";
import RegistrationPending from './pages/RegistrationPending';
import CourseDetail from './pages/CourseDetail';
import Courses from './pages/Courses';
import TutorialDetail from './pages/TutorialDetail';

const AppContent = () => {
  const { initializeAuth, isLoading } = useAuth();

  useEffect(() => {
    console.log('🚀 App.tsx - Initializing auth...');
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/registration-pending" element={<RegistrationPending />} />

            {/* Public Course Catalog & Detail */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/tutorials/:id" element={<TutorialDetail />} />

            {/* Legacy / Tutorials (optional redirect or alias) */}
            <Route 
              path="/tutorials" 
              element={<Courses />}  // or <Navigate to="/courses" replace />
            />

            {/* Protected Tutor Profile */}
            <Route path="/tutor/profile" element={<TutorProfilePage />} />

            {/* Protected Student Profile */}
            <Route path="/student/profile" element={<StudentProfile />} />

            {/* Protected Student Dashboard & Learning Routes */}
            <Route 
              path="/student" 
              element={
                <ProtectedRoute requiredRole="student">
                  <Student />
                </ProtectedRoute>
              } 
            />

            {/* Student Specific Lesson View */}
            <Route 
              path="/student/learn/:courseId/lesson/:lessonId" 
              element={
                <ProtectedRoute requiredRole="student">
                  <Student />
                </ProtectedRoute>
              } 
            />

            {/* Protected Tutor Dashboard */}
            <Route 
              path="/tutor" 
              element={
                <ProtectedRoute requiredRole="tutor">
                  <Tutor />
                </ProtectedRoute>
              } 
            />

            {/* Protected Admin Dashboard */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Admin />
                </ProtectedRoute>
              } 
            />

            {/* Protected Super Admin Dashboard */}
            <Route 
              path="/super-admin" 
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <SuperAdmin />
                </ProtectedRoute>
              } 
            />

            {/* Protected Staff Dashboard (placeholder) */}
            <Route 
              path="/staff" 
              element={
                <ProtectedRoute requiredRole="staff">
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold mb-4">Staff Dashboard</h1>
                      <p className="text-muted-foreground">Staff dashboard coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => {
  return (
    <DarkModeProvider>
      <AppContent />
    </DarkModeProvider>
  );
};

export default App;