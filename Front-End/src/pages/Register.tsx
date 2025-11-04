"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import StudentForm from "@/components/register/StudentForm";
import TutorForm from "@/components/register/TutorForm";

const Register = () => {
  const [isStudent, setIsStudent] = useState(true);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Register</h1>
          
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;