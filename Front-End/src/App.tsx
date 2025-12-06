import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import { DarkModeProvider } from '@/contexts/DarkModeProvider';

import Home from "./pages/Home";
import Tutorials from "./pages/Tutorials";
import TutorialDetail from "./pages/TutorialDetail";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Tutor from "./pages/TutorDashboard";
import Student from "./pages/StudentDashboard";
import Admin from "./pages/AdminDashboard";
import SuperAdmin from "./pages/SuperAdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import TutorProfilePage from "./pages/TutorProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentProfile from "./pages/StudentProfilePage";
import RegistrationPending from './pages/RegistrationPending';

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
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route 
              path="/tutorials" 
              element={
                <ProtectedRoute requiredRole="student">
                  <Tutorials />
                </ProtectedRoute>
              } 
            />
            <Route path="/tutorial/:id" element={<TutorialDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tutor/profile" element={<TutorProfilePage />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/registration-pending" element={<RegistrationPending />} />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/super-admin" 
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <SuperAdmin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Admin />
                </ProtectedRoute>
              } 
            />
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
            <Route 
              path="/tutor" 
              element={
                <ProtectedRoute requiredRole="tutor">
                  <Tutor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student" 
              element={
                <ProtectedRoute requiredRole="student">
                  <Student />
                </ProtectedRoute>
              } 
            />
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