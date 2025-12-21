"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Shield, Upload, Code, Globe, GraduationCap, Clock, DollarSign, Briefcase } from "lucide-react";
import { apiClient } from "@/lib/api";

// Import shared constants
const countries = ["Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia", "Denmark", "Egypt", "Ethiopia", "Finland", "France", "Germany", "Ghana", "Greece", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Jordan", "Kenya", "Lebanon", "Malaysia", "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", "Syria", "Thailand", "Turkey", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Venezuela", "Vietnam", "Yemen"];
const ethiopianCities = ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Hawassa", "Bahir Dar", "Jimma", "Adama", "Dessie", "Jijiga"];
const addisAbabaSubcities = ["Addis Ketema", "Akaky Kaliti", "Arada", "Bole", "Gullele", "Kirkos", "Kolfe Keranio", "Lideta", "Nifas Silk-Lafto", "Yeka", "Lemi Kura"];
const phoneCodes: Record<string, string> = { "Ethiopia": "+251", "United States": "+1", "United Kingdom": "+44", "Canada": "+1", "Australia": "+61", "Germany": "+49", "France": "+33", "India": "+91", "China": "+86", "Japan": "+81", "Brazil": "+55", "Mexico": "+52", "Spain": "+34", "Italy": "+39", "Netherlands": "+31", "Sweden": "+46", "Norway": "+47", "Denmark": "+45", "Finland": "+358", "Russia": "+7", "South Korea": "+82", "Singapore": "+65", "Saudi Arabia": "+966", "United Arab Emirates": "+971", "Egypt": "+20", "Nigeria": "+234", "Kenya": "+254", "South Africa": "+27" };

interface AvailabilityTime {
  start: string;
  end: string;
}

const TutorForm = () => {
  const [tutorForm, setTutorForm] = useState({
    // Personal info
    name: "", 
    fatherName: "", 
    email: "", 
    password: "", 
    password_confirmation: "", 
    age: "", 
    country: "", 
    phoneCode: "", 
    phone: "", 
    city: "", 
    subcity: "", 
    sex: "", 
    address: "",
    
    // Professional info
    bio: "",
    qualification: "",
    hourlyRate: "",
    
    // Experience info
    hasExperience: "no", // "yes" or "no"
    experienceYears: "", // Only shown when hasExperience is "yes"
    previousGrades: "", // Only shown when hasExperience is "yes"
    
    // Degree info
    degree: "", 
    status: "", 
    degreePhoto: null as File | null,
    
    // Specialization
    specialty: "", 
    specialtyArea: [] as string[], 
    specialtyLanguages: [] as string[], 
    gradeRange: "", 
    curriculum: "",
    
    // Availability
    availableDays: [] as string[],
    availabilityTimes: {} as Record<string, AvailabilityTime>,
    
    // Subject levels
    subjectLevels: {} as Record<string, string>,
    
    // Teaching preferences
    tutoringMode: "", 
    tutoringArea: "",
  });

  const [captchaToken, setCaptchaToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const languages = ["Amharic 🇪🇹", "English 🇬🇧", "Afan Oromo 🇪🇹", "Chinese 🇨🇳", "Arabic 🇸🇦", "French 🇫🇷"];

  // Handle tutoring mode selection
  const handleTutoringMode = (mode: string) => {
    setTutorForm(prev => ({
      ...prev,
      tutoringMode: mode,
      tutoringArea: mode === "Online" ? "" : prev.tutoringArea
    }));
  };

  // Auto-set Online mode for non-Ethiopia locations
  useEffect(() => {
    if (tutorForm.country && tutorForm.country !== "Ethiopia" && tutorForm.tutoringMode === "Home-to-Home") {
      setTutorForm(prev => ({
        ...prev,
        tutoringMode: "Online",
        tutoringArea: ""
      }));
    }
  }, [tutorForm.country, tutorForm.tutoringMode]);

  // Initialize availability times when days are selected
  useEffect(() => {
    const newTimes = { ...tutorForm.availabilityTimes };
    let updated = false;
    
    tutorForm.availableDays.forEach(day => {
      if (!newTimes[day]) {
        newTimes[day] = { start: "09:00", end: "17:00" };
        updated = true;
      }
    });
    
    // Remove times for days that are no longer selected
    Object.keys(newTimes).forEach(day => {
      if (!tutorForm.availableDays.includes(day)) {
        delete newTimes[day];
        updated = true;
      }
    });
    
    if (updated) {
      setTutorForm(prev => ({ ...prev, availabilityTimes: newTimes }));
    }
  }, [tutorForm.availableDays]);

  const handleTutorSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Set loading state early
  setIsLoading(true);

  // CAPTCHA validation
  if (!captchaToken) {
    toast({
      title: "Security Verification Required",
      description: "Please complete the CAPTCHA check.",
      variant: "destructive",
    });
    setIsLoading(false);
    return;
  }

  // Validate required fields
  const errors: string[] = [];
  
  // ... your validation code remains the same ...

  if (errors.length > 0) {
    toast({ 
      title: "Validation Error", 
      description: errors.join("\n"), 
      variant: "destructive" 
    });
    setIsLoading(false);
    return;
  }

  try {
    const formData = new FormData();

    // 1. Build subjects array in backend format
    let subjectsArray: Array<{name: string, specialization: string | null, level: string}> = [];
    
    if (tutorForm.specialty === "Programming") {
      subjectsArray = tutorForm.specialtyArea.map(area => ({
        name: area,
        specialization: tutorForm.specialty,
        level: tutorForm.subjectLevels[area] || "intermediate"
      }));
    } else if (tutorForm.specialty === "Language") {
      subjectsArray = tutorForm.specialtyLanguages.map(lang => ({
        name: lang,
        specialization: "Language",
        level: tutorForm.subjectLevels[lang] || "intermediate"
      }));
    } else if (tutorForm.specialty === "School Grades") {
      subjectsArray = [{
        name: tutorForm.curriculum || "School Curriculum",
        specialization: `Grades ${tutorForm.gradeRange}`,
        level: "intermediate"
      }];
    }

    // 2. Build availability array in backend format
    const availabilityArray = tutorForm.availableDays.map(day => ({
      day: day,
      startTime: tutorForm.availabilityTimes[day]?.start || "09:00",
      endTime: tutorForm.availabilityTimes[day]?.end || "17:00"
    }));

    // 3. Append ALL fields to FormData
    // First, append simple fields
    formData.append("user_type", "tutor");
    formData.append("role", "tutor");
    formData.append("name", tutorForm.name);
    formData.append("email", tutorForm.email);
    formData.append("password", tutorForm.password);
    formData.append("password_confirmation", tutorForm.password_confirmation);
    formData.append("phone", `${tutorForm.phoneCode}${tutorForm.phone}`);
    formData.append("age", tutorForm.age);
    formData.append("sex", tutorForm.sex);
    formData.append("country", tutorForm.country);
    formData.append("phoneCode", tutorForm.phoneCode);
    formData.append("city", tutorForm.city || "");
    formData.append("subcity", tutorForm.subcity || "");
    formData.append("address", tutorForm.address);
    formData.append("bio", tutorForm.bio);
    formData.append("qualification", tutorForm.qualification);
    formData.append("experienceYears", tutorForm.hasExperience === "yes" ? tutorForm.experienceYears : "0");
    formData.append("hourlyRate", tutorForm.hourlyRate);
    formData.append("degree", tutorForm.degree);
    formData.append("status", tutorForm.status);
    formData.append("previousExperience", tutorForm.hasExperience);
    formData.append("previousGrades", tutorForm.previousGrades || "");
    formData.append("tutoringMode", tutorForm.tutoringMode);
    formData.append("tutoringArea", tutorForm.tutoringArea || "");
    formData.append("captcha_token", captchaToken);

    // 4. Append subjects array properly (DO NOT stringify!)
    subjectsArray.forEach((subject, index) => {
      formData.append(`subjects[${index}][name]`, subject.name);
      if (subject.specialization) {
        formData.append(`subjects[${index}][specialization]`, subject.specialization);
      }
      formData.append(`subjects[${index}][level]`, subject.level);
    });

    // 5. Append availability array properly (DO NOT stringify!)
    availabilityArray.forEach((slot, index) => {
      formData.append(`availability[${index}][day]`, slot.day);
      formData.append(`availability[${index}][startTime]`, slot.startTime);
      formData.append(`availability[${index}][endTime]`, slot.endTime);
    });

    // 6. Add file
    if (tutorForm.degreePhoto) {
      formData.append("degreePhoto", tutorForm.degreePhoto);
    }

    // Debug: Log what we're sending
    console.log("Subjects array:", subjectsArray);
    console.log("Availability array:", availabilityArray);
    
    // Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // 7. Make API request
    await apiClient.post("/register/tutor", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // ✅ RESET CAPTCHA ON SUCCESS
    recaptchaRef.current?.reset();
    setCaptchaToken("");

    toast({ 
      title: "Registration Successful",
      description: "Your application has been submitted for review. We'll notify you once approved."
    });
    
    // Reset form
    setTutorForm({
      name: "", fatherName: "", email: "", password: "", password_confirmation: "", 
      age: "", country: "", phoneCode: "", phone: "", city: "", subcity: "", 
      sex: "", address: "", bio: "", qualification: "", hourlyRate: "",
      hasExperience: "no", experienceYears: "", previousGrades: "",
      degree: "", status: "", degreePhoto: null, specialty: "", 
      specialtyArea: [], specialtyLanguages: [], gradeRange: "", curriculum: "", 
      availableDays: [], availabilityTimes: {}, subjectLevels: {}, 
      tutoringMode: "", tutoringArea: ""
    });
    
    navigate("/login");
    
  } catch (err: any) {
    /** 🔁 RESET CAPTCHA ON SERVER FAILURE */
    recaptchaRef.current?.reset();
    setCaptchaToken("");

    console.error("Registration error:", err.response?.data);
    
    toast({
      title: "Registration Failed",
      description: err.response?.data?.message || 
                 (err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : "Server rejected the request."),
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  const toggleDay = (day: string) => {
    setTutorForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const toggleItem = (item: string, array: string[], setter: (val: string[]) => void) => {
    setter(array.includes(item) ? array.filter(i => i !== item) : [...array, item]);
  };

  return (
    <form onSubmit={handleTutorSubmit} className="bg-card rounded-lg shadow-elegant p-8 space-y-6 border border-border">
      <h2 className="text-2xl font-semibold mb-4 text-center">Tutor Registration</h2>

      {/* Personal Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="t-name">Full Name *</Label>
            <Input id="t-name" value={tutorForm.name} onChange={(e) => setTutorForm({...tutorForm, name: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-father">Father's Name *</Label>
            <Input id="t-father" value={tutorForm.fatherName} onChange={(e) => setTutorForm({...tutorForm, fatherName: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-email">Email Address *</Label>
            <Input id="t-email" type="email" value={tutorForm.email} onChange={(e) => setTutorForm({...tutorForm, email: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-age">Age *</Label>
            <Input id="t-age" type="number" min="18" max="100" value={tutorForm.age} onChange={(e) => setTutorForm({...tutorForm, age: e.target.value})} required />
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="t-password">Password *</Label>
            <Input 
              id="t-password" 
              type="password" 
              value={tutorForm.password}
              onChange={(e) => setTutorForm({...tutorForm, password: e.target.value})}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-password-confirm">Confirm Password *</Label>
            <Input 
              id="t-password-confirm" 
              type="password" 
              value={tutorForm.password_confirmation}
              onChange={(e) => setTutorForm({...tutorForm, password_confirmation: e.target.value})}
              required 
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="t-country">Country *</Label>
            <Select value={tutorForm.country} onValueChange={(val) => setTutorForm({...tutorForm, country: val, phoneCode: phoneCodes[val] || "+1", city: "", subcity: ""})}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent className="max-h-60">{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-phone">Phone Number *</Label>
            <div className="flex gap-2">
              <Input className="w-24" value={tutorForm.phoneCode} readOnly placeholder="+1" />
              <Input id="t-phone" type="tel" value={tutorForm.phone} onChange={(e) => setTutorForm({...tutorForm, phone: e.target.value})} required />
            </div>
          </div>
        </div>

        {tutorForm.country === "Ethiopia" && (
          <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="t-city">City *</Label>
              <Select value={tutorForm.city} onValueChange={(val) => setTutorForm({...tutorForm, city: val, subcity: ""})}>
                <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>{ethiopianCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {tutorForm.city === "Addis Ababa" && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="t-subcity">Subcity *</Label>
                <Select value={tutorForm.subcity} onValueChange={(val) => setTutorForm({...tutorForm, subcity: val})}>
                  <SelectTrigger><SelectValue placeholder="Select subcity" /></SelectTrigger>
                  <SelectContent>{addisAbabaSubcities.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Address Field */}
        <div className="space-y-2">
          <Label htmlFor="t-address">Address *</Label>
          <Input 
            id="t-address" 
            value={tutorForm.address} 
            onChange={(e) => setTutorForm({...tutorForm, address: e.target.value})} 
            placeholder="Your full address"
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="t-sex">Gender *</Label>
          <Select value={tutorForm.sex} onValueChange={(val) => setTutorForm({...tutorForm, sex: val})}>
            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Professional Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Professional Information</h3>
        
        {/* Bio Field */}
        <div className="space-y-2">
          <Label htmlFor="t-bio">
            Bio/Introduction * 
            <span className="text-sm text-muted-foreground ml-2">(min. 50 characters)</span>
          </Label>
          <textarea
            id="t-bio"
            value={tutorForm.bio}
            onChange={(e) => setTutorForm({...tutorForm, bio: e.target.value})}
            className="w-full min-h-[120px] p-3 border border-input rounded-md bg-background"
            placeholder="Tell us about yourself, your teaching philosophy, experience, etc. Minimum 50 characters."
            required
          />
          {tutorForm.bio.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className={tutorForm.bio.length < 50 ? "text-amber-600" : "text-green-600"}>
                {tutorForm.bio.length} / 50 characters
              </span>
              {tutorForm.bio.length < 50 && (
                <span className="text-amber-600">{50 - tutorForm.bio.length} more needed</span>
              )}
            </div>
          )}
        </div>

        {/* Qualification Field */}
        <div className="space-y-2">
          <Label htmlFor="t-qualification">Qualifications/Certifications *</Label>
          <textarea
            id="t-qualification"
            value={tutorForm.qualification}
            onChange={(e) => setTutorForm({...tutorForm, qualification: e.target.value})}
            className="w-full min-h-[80px] p-3 border border-input rounded-md bg-background"
            placeholder="List your qualifications, certifications, degrees, etc."
            required
          />
        </div>

        {/* Hourly Rate */}
        <div className="space-y-2">
          <Label htmlFor="t-hourly-rate">
            <DollarSign className="inline mr-2 h-4 w-4" />
            Hourly Rate (USD) *
          </Label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
            <Input 
              id="t-hourly-rate" 
              type="number" 
              min="1" 
              step="0.5"
              value={tutorForm.hourlyRate}
              onChange={(e) => setTutorForm({...tutorForm, hourlyRate: e.target.value})}
              placeholder="20.00"
              className="pl-8"
              required 
            />
          </div>
          <p className="text-sm text-muted-foreground">This is the rate you want to charge per hour of tutoring</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="degree">Highest Degree Level *</Label>
            <Select value={tutorForm.degree} onValueChange={(val) => setTutorForm({...tutorForm, degree: val})}>
              <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="phd">PhD</SelectItem>
                <SelectItem value="masters">Masters</SelectItem>
                <SelectItem value="bachelors">Bachelors</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Professional Status *</Label>
            <Select value={tutorForm.status} onValueChange={(val) => setTutorForm({...tutorForm, status: val})}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="government">Government Employee</SelectItem>
                <SelectItem value="private">Private Sector</SelectItem>
                <SelectItem value="unemployed">Unemployed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Experience Section - Fixed! */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              <Briefcase className="inline mr-2 h-4 w-4" />
              Previous Tutoring Experience *
            </Label>
            <RadioGroup 
              value={tutorForm.hasExperience} 
              onValueChange={(val) => setTutorForm({
                ...tutorForm, 
                hasExperience: val, 
                experienceYears: val === "no" ? "" : tutorForm.experienceYears,
                previousGrades: val === "no" ? "" : tutorForm.previousGrades
              })} 
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="exp-yes" />
                <Label htmlFor="exp-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="exp-no" />
                <Label htmlFor="exp-no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {tutorForm.hasExperience === "yes" && (
            <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="exp-years">Years of Experience *</Label>
                <Input 
                  id="exp-years" 
                  type="number" 
                  min="0" 
                  max="50" 
                  value={tutorForm.experienceYears}
                  onChange={(e) => setTutorForm({...tutorForm, experienceYears: e.target.value})}
                  placeholder="e.g., 3"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prev-grades">Which Grade(s) Did You Teach? *</Label>
                <Input 
                  id="prev-grades" 
                  value={tutorForm.previousGrades} 
                  onChange={(e) => setTutorForm({...tutorForm, previousGrades: e.target.value})} 
                  placeholder="e.g., Grade 9-12, University level, etc."
                  required 
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="degree-photo">Upload Degree/Certificate Photo *</Label>
          <div className="flex items-center gap-4">
            <Input
              id="degree-photo"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setTutorForm({...tutorForm, degreePhoto: e.target.files?.[0] || null})}
              className="hidden"
            />
            <Button type="button" variant="outline" onClick={() => document.getElementById('degree-photo')?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </Button>
            <span className="text-sm text-muted-foreground">
              {tutorForm.degreePhoto ? tutorForm.degreePhoto.name : "No file chosen"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Accepted: JPG, PNG, PDF (Max 5MB)</p>
        </div>
      </div>

      {/* Teaching Specialization Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Teaching Specialization</h3>
        <div className="space-y-2">
          <Label>What is your specialty? *</Label>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { spec: "Programming", icon: Code, color: "border-blue-500 hover:border-blue-600" },
              { spec: "Language", icon: Globe, color: "border-green-500 hover:border-green-600" },
              { spec: "School Grades", icon: GraduationCap, color: "border-purple-500 hover:border-purple-600" }
            ].map(item => (
              <div
                key={item.spec}
                onClick={() => setTutorForm({
                  ...tutorForm, 
                  specialty: item.spec, 
                  specialtyArea: [], 
                  specialtyLanguages: [], 
                  gradeRange: "", 
                  curriculum: "",
                  subjectLevels: {}
                })}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  tutorForm.specialty === item.spec 
                    ? "border-primary bg-gradient-primary text-primary-foreground shadow-glow" 
                    : `border-border hover:border-primary/50 bg-card ${item.color}`
                }`}
              >
                <item.icon className="w-10 h-10 mb-2 mx-auto" />
                <p className="font-bold text-center">{item.spec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic content based on specialty */}
        {tutorForm.specialty === "Programming" && (
          <div className="space-y-3 animate-fade-in">
            <Label>Select Programming Area(s) and Level *</Label>
            <div className="space-y-3">
              {["AI", "Web Development", "App Development"].map(area => (
                <div key={area} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <Button
                      type="button"
                      onClick={() => {
                        const newAreas = tutorForm.specialtyArea.includes(area) 
                          ? tutorForm.specialtyArea.filter(a => a !== area)
                          : [...tutorForm.specialtyArea, area];
                        setTutorForm({...tutorForm, specialtyArea: newAreas});
                      }}
                      variant={tutorForm.specialtyArea.includes(area) ? "default" : "outline"}
                      className="w-full"
                    >
                      {area}
                    </Button>
                  </div>
                  {tutorForm.specialtyArea.includes(area) && (
                    <div className="w-40">
                      <Select
                        value={tutorForm.subjectLevels[area] || "intermediate"}
                        onValueChange={(level) => setTutorForm({
                          ...tutorForm,
                          subjectLevels: {
                            ...tutorForm.subjectLevels,
                            [area]: level
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tutorForm.specialty === "Language" && (
          <div className="space-y-3 animate-fade-in">
            <Label>Select Language(s) and Proficiency Level *</Label>
            <div className="space-y-3">
              {languages.map(lang => (
                <div key={lang} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <Button
                      type="button"
                      onClick={() => {
                        const newLangs = tutorForm.specialtyLanguages.includes(lang) 
                          ? tutorForm.specialtyLanguages.filter(l => l !== lang)
                          : [...tutorForm.specialtyLanguages, lang];
                        setTutorForm({...tutorForm, specialtyLanguages: newLangs});
                      }}
                      variant={tutorForm.specialtyLanguages.includes(lang) ? "default" : "outline"}
                      className="w-full"
                    >
                      {lang}
                    </Button>
                  </div>
                  {tutorForm.specialtyLanguages.includes(lang) && (
                    <div className="w-40">
                      <Select
                        value={tutorForm.subjectLevels[lang] || "intermediate"}
                        onValueChange={(level) => setTutorForm({
                          ...tutorForm,
                          subjectLevels: {
                            ...tutorForm.subjectLevels,
                            [lang]: level
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tutorForm.specialty === "School Grades" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade-range">Grade Range *</Label>
                <Select value={tutorForm.gradeRange} onValueChange={(val) => setTutorForm({...tutorForm, gradeRange: val})}>
                  <SelectTrigger><SelectValue placeholder="Select grade range" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-4">Grade 1-4</SelectItem>
                    <SelectItem value="5-8">Grade 5-8</SelectItem>
                    <SelectItem value="9-12">Grade 9-12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="curriculum">Curriculum *</Label>
                <Select value={tutorForm.curriculum} onValueChange={(val) => setTutorForm({...tutorForm, curriculum: val})}>
                  <SelectTrigger><SelectValue placeholder="Select curriculum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">National Curriculum</SelectItem>
                    <SelectItem value="international">International Curriculum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Level selection for School Grades */}
            <div className="space-y-2">
              <Label>Teaching Level *</Label>
              <Select
                value={tutorForm.subjectLevels["school"] || "intermediate"}
                onValueChange={(level) => setTutorForm({
                  ...tutorForm,
                  subjectLevels: {
                    ...tutorForm.subjectLevels,
                    "school": level
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teaching level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner Level</SelectItem>
                  <SelectItem value="intermediate">Intermediate Level</SelectItem>
                  <SelectItem value="advanced">Advanced Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Availability Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">
          <Clock className="inline mr-2 h-5 w-5" />
          Availability Schedule *
        </h3>
        
        <div className="space-y-3">
          <Label>Select your available days and time slots:</Label>
          {weekDays.map(day => (
            <div key={day} className="flex flex-wrap items-center gap-2 p-3 border rounded-lg hover:bg-accent/50">
              <Button
                type="button"
                onClick={() => toggleDay(day)}
                variant={tutorForm.availableDays.includes(day) ? "default" : "outline"}
                size="sm"
                className="w-28"
              >
                {day}
              </Button>
              
              {tutorForm.availableDays.includes(day) && (
                <div className="flex flex-1 items-center gap-2 ml-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="time"
                      className="w-32"
                      value={tutorForm.availabilityTimes[day]?.start || "09:00"}
                      onChange={(e) => {
                        const newTimes = {
                          ...tutorForm.availabilityTimes,
                          [day]: {
                            ...tutorForm.availabilityTimes[day],
                            start: e.target.value
                          }
                        };
                        setTutorForm({...tutorForm, availabilityTimes: newTimes});
                      }}
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input 
                      type="time"
                      className="w-32"
                      value={tutorForm.availabilityTimes[day]?.end || "17:00"}
                      onChange={(e) => {
                        const newTimes = {
                          ...tutorForm.availabilityTimes,
                          [day]: {
                            ...tutorForm.availabilityTimes[day],
                            end: e.target.value
                          }
                        };
                        setTutorForm({...tutorForm, availabilityTimes: newTimes});
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Select at least one day and set your available time slots</p>
      </div>

      {/* Tutoring Mode Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Tutoring Preferences</h3>
        
        {(tutorForm.country === "Ethiopia" || !tutorForm.country) && (
          <div className="space-y-3 animate-fade-in">
            <Label>Mode of Tutoring *</Label>
            <div className="grid md:grid-cols-2 gap-3">
              {["Online", "Home-to-Home"].map(mode => (
                <Button
                  key={mode}
                  type="button"
                  onClick={() => handleTutoringMode(mode)}
                  variant={tutorForm.tutoringMode === mode ? "default" : "outline"}
                  className="h-auto py-4"
                  disabled={mode === "Home-to-Home" && tutorForm.city !== "Addis Ababa"}
                >
                  {mode}
                  {mode === "Home-to-Home" && tutorForm.city !== "Addis Ababa" && (
                    <span className="text-xs ml-2 opacity-70">(Addis only)</span>
                  )}
                </Button>
              ))}
            </div>
            
            {tutorForm.country === "Ethiopia" && tutorForm.city && tutorForm.city !== "Addis Ababa" && (
              <p className="text-sm text-muted-foreground text-center">
                Home-to-Home tutoring is only available in Addis Ababa
              </p>
            )}
            
            {tutorForm.tutoringMode === "Home-to-Home" && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="tutor-area">Which area can you tutor? *</Label>
                <Input 
                  id="tutor-area" 
                  value={tutorForm.tutoringArea} 
                  onChange={(e) => setTutorForm({...tutorForm, tutoringArea: e.target.value})} 
                  placeholder="e.g., Bole, Kirkos, Arada" 
                  required 
                />
              </div>
            )}
          </div>
        )}

        {/* Auto Online mode for non-Ethiopia locations */}
        {tutorForm.country && tutorForm.country !== "Ethiopia" && (
          <div className="space-y-3 animate-fade-in">
            <Label>Mode of Tutoring *</Label>
            <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="font-medium">Online Tutoring</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 ml-6">
                Only online tutoring is available for locations outside Ethiopia
              </p>
            </div>
            <input type="hidden" name="tutoringMode" value="Online" />
          </div>
        )}
      </div>

      {/* Security Section */}
      <div className="space-y-4">
        <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <Shield className="h-5 w-5 text-blue-600" />
          <p className="text-sm text-blue-800">
            Please complete the CAPTCHA verification to proceed.
          </p>
        </div>

        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          onChange={(token) => setCaptchaToken(token || "")}
        />
      </div>

      <Button type="submit" className="w-full" variant="default" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Submitting Application...
          </>
        ) : (
          "Submit Tutor Application"
        )}
      </Button>
    </form>
  );
};

export default TutorForm;