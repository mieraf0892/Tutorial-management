import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Tutorials from "./pages/Tutorials";
import TutorialDetail from "./pages/TutorialDetail";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Tutor from "./pages/TutorDashboard";
import Student from "./pages/StudentDashboard";
import Admin from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register"
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute"; // Add this import

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/tutorial/:id" element={<TutorialDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Dashboard Routes */}
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
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            } 
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;