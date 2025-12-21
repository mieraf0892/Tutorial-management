// app/register/page.tsx - Just add a small notice
"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import StudentForm from "@/components/register/StudentForm";
import TutorForm from "@/components/register/TutorForm";
import { Shield } from "lucide-react";

const Register = () => {
  const [isStudent, setIsStudent] = useState(true);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-2">Register</h1>
          
          {/* Add security notice */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">Protected by reCAPTCHA</span>
            </div>
          </div>
          
          {/* Toggle Buttons */}
          <div className="flex gap-4 mb-8 justify-center">
            <Button
              onClick={() => setIsStudent(true)}
              variant={isStudent ? "default" : "outline"}
              size="lg"
              className="flex-1 max-w-xs"
            >
              Register as Student
            </Button>
            <Button
              onClick={() => setIsStudent(false)}
              variant={!isStudent ? "default" : "outline"}
              size="lg"
              className="flex-1 max-w-xs"
            >
              Register as Tutor
            </Button>
          </div>

          {/* Render the appropriate form */}
          {isStudent ? <StudentForm /> : <TutorForm />}
          
          {/* Add note about CAPTCHA */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              We use CAPTCHA verification to prevent automated registrations. 
              Please complete the CAPTCHA before submitting.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;