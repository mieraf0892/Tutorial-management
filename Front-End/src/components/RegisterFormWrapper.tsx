// components/register/RegisterFormWrapper.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Base schema shared by both student and tutor
const baseUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const studentSchema = baseUserSchema.safeExtend({
  user_type: z.literal("student"),
  student_id: z.string().optional(),
  department: z.string().optional(),
});


const tutorSchema = baseUserSchema.safeExtend({
  user_type: z.literal("tutor"),
  qualifications: z.string().min(10, "Qualifications must be at least 10 characters"),
  experience_years: z.number().min(0, "Experience cannot be negative"),
  hourly_rate: z.number().min(0, "Hourly rate must be positive"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
});


type StudentFormData = z.infer<typeof studentSchema>;
type TutorFormData = z.infer<typeof tutorSchema>;

interface RegisterFormWrapperProps {
  isStudent: boolean;
}

export default function RegisterFormWrapper({ isStudent }: RegisterFormWrapperProps) {
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const studentForm = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      user_type: "student",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      student_id: "",
      department: "",
    },
  });

  const tutorForm = useForm<TutorFormData>({
    resolver: zodResolver(tutorSchema),
    defaultValues: {
      user_type: "tutor",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      qualifications: "",
      experience_years: 0,
      hourly_rate: 0,
      bio: "",
    },
  });

  const form = isStudent ? studentForm : tutorForm;

  const onSubmit = async (data: any) => {
    // Check CAPTCHA
    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA verification");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          captcha_token: captchaToken,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (isStudent) {
          toast.success("Registration successful! Please check your email to verify your account.");
          // Redirect to email verification page
          window.location.href = "/verify-email";
        } else {
          toast.success("Registration submitted! Your account is pending admin approval. You'll receive an email once approved.");
          // Redirect to pending approval page
          window.location.href = "/pending-approval";
        }
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Common Fields */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Student Specific Fields */}
          {isStudent && (
            <>
              <FormField
                control={form.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 20230001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Tutor Specific Fields */}
          {!isStudent && (
            <>
              <FormField
                control={form.control}
                name="qualifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualifications</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., M.Sc. in Mathematics, 5 years teaching experience" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hourly_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <textarea 
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Tell us about your teaching experience, methods, and subjects you specialize in..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* CAPTCHA */}
          <div className="py-4">
            <ReCAPTCHA
                sitekey={
                    import.meta.env.PROD
                        ? import.meta.env.VITE_RECAPTCHA_SITE_KEY
                        : "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key for development
                }
                onChange={(token) => setCaptchaToken(token || "")}
            />
          </div>

          {/* Terms and Conditions */}
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              By registering, you agree to our Terms of Service and Privacy Policy.
            </p>
            {!isStudent && (
              <p className="text-amber-600">
                Note: Tutor accounts require admin approval before you can accept bookings.
                You'll receive an email notification once approved.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              `Register as ${isStudent ? 'Student' : 'Tutor'}`
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}