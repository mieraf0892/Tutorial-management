"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Upload, Code, Globe, GraduationCap } from "lucide-react";
import { apiClient } from "@/lib/api";

// Import shared constants
const countries = ["Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia", "Denmark", "Egypt", "Ethiopia", "Finland", "France", "Germany", "Ghana", "Greece", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Jordan", "Kenya", "Lebanon", "Malaysia", "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", "Syria", "Thailand", "Turkey", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Venezuela", "Vietnam", "Yemen"];
const ethiopianCities = ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Hawassa", "Bahir Dar", "Jimma", "Adama", "Dessie", "Jijiga"];
const addisAbabaSubcities = ["Addis Ketema", "Akaky Kaliti", "Arada", "Bole", "Gullele", "Kirkos", "Kolfe Keranio", "Lideta", "Nifas Silk-Lafto", "Yeka", "Lemi Kura"];
const phoneCodes: Record<string, string> = { "Ethiopia": "+251", "United States": "+1", "United Kingdom": "+44", "Canada": "+1", "Australia": "+61", "Germany": "+49", "France": "+33", "India": "+91", "China": "+86", "Japan": "+81", "Brazil": "+55", "Mexico": "+52", "Spain": "+34", "Italy": "+39", "Netherlands": "+31", "Sweden": "+46", "Norway": "+47", "Denmark": "+45", "Finland": "+358", "Russia": "+7", "South Korea": "+82", "Singapore": "+65", "Saudi Arabia": "+966", "United Arab Emirates": "+971", "Egypt": "+20", "Nigeria": "+234", "Kenya": "+254", "South Africa": "+27" };

const TutorForm = () => {
  const [tutorForm, setTutorForm] = useState({
    name: "", fatherName: "", email: "", password: "", password_confirmation: "", age: "", country: "", phoneCode: "", phone: "",
    city: "", subcity: "", sex: "", degree: "", status: "", experience: "", previousGrades: "",
    degreePhoto: null as File | null, specialty: "", specialtyArea: [] as string[], 
    specialtyLanguages: [] as string[], gradeRange: "", curriculum: "",
    availableDays: [] as string[], availableTimes: [] as string[], tutoringMode: "", tutoringArea: "", address: ""
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots = ["10-11 AM", "11-12 PM", "12-1 PM", "1-2 PM", "Anytime"];
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

  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate specialty selection
    if (!tutorForm.specialty) {
      toast({ title: "Error", description: "Please select your teaching specialty", variant: "destructive" });
      return;
    }
    
    // Validate password
    if (!tutorForm.password || tutorForm.password !== tutorForm.password_confirmation) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    
    // Validate tutoring mode for Ethiopian tutors
    if (tutorForm.country === "Ethiopia" && !tutorForm.tutoringMode) {
      toast({ title: "Error", description: "Please select your tutoring mode", variant: "destructive" });
      return;
    }
    
    // Validate home-to-home area if selected
    if (tutorForm.tutoringMode === "Home-to-Home" && !tutorForm.tutoringArea) {
      toast({ title: "Error", description: "Please specify which area you can tutor in", variant: "destructive" });
      return;
    }
    
    try {
      // Prepare data for backend
      const backendData = {
        // User data
        name: tutorForm.name,
        email: tutorForm.email,
        password: tutorForm.password,
        password_confirmation: tutorForm.password_confirmation,
        
        // Tutor personal information  
        phone: tutorForm.phone,
        age: parseInt(tutorForm.age),
        sex: tutorForm.sex,
        country: tutorForm.country,
        phoneCode: tutorForm.phoneCode,
        city: tutorForm.city,
        subcity: tutorForm.subcity,
        address: tutorForm.address || `${tutorForm.city}, ${tutorForm.country}`,
        
        // Professional information
        bio: `Experienced ${tutorForm.specialty.toLowerCase()} tutor with ${tutorForm.experience === "yes" ? "previous experience" : "no previous experience"}. Available for ${tutorForm.tutoringMode.toLowerCase()} tutoring.`,
        qualification: tutorForm.degree,
        experienceYears: tutorForm.experience === "yes" ? (tutorForm.previousGrades ? 2 : 1) : 0,
        hourlyRate: 200,
        
        // Subjects - convert based on specialty
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subjects: [] as any[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        availability: [] as any[]
      };

      // Convert subjects based on specialty
      if (tutorForm.specialty === "Programming" && tutorForm.specialtyArea.length > 0) {
        backendData.subjects = tutorForm.specialtyArea.map(area => ({
          name: "Programming",
          specialization: area,
          level: "intermediate"
        }));
      } else if (tutorForm.specialty === "Language" && tutorForm.specialtyLanguages.length > 0) {
        backendData.subjects = tutorForm.specialtyLanguages.map(lang => ({
          name: "Language", 
          specialization: lang.replace(/🇪🇹|🇬🇧|🇨🇳|🇸🇦|🇫🇷/g, '').trim(),
          level: "advanced"
        }));
      } else if (tutorForm.specialty === "School Grades") {
        backendData.subjects = [{
          name: "School Subjects",
          specialization: `Grades ${tutorForm.gradeRange} - ${tutorForm.curriculum} Curriculum`,
          level: "intermediate"
        }];
      }

      // Convert availability
      if (tutorForm.availableDays.length > 0 && tutorForm.availableTimes.length > 0) {
        const timeMap: Record<string, { start: string; end: string }> = {
          "10-11 AM": { start: "10:00", end: "11:00" },
          "11-12 PM": { start: "11:00", end: "12:00" }, 
          "12-1 PM": { start: "12:00", end: "13:00" },
          "1-2 PM": { start: "13:00", end: "14:00" },
          "Anytime": { start: "09:00", end: "17:00" }
        };
        
        const selectedTime = timeMap[tutorForm.availableTimes[0]];
        if (selectedTime) {
          backendData.availability = tutorForm.availableDays.map(day => ({
            day: day,
            startTime: selectedTime.start,
            endTime: selectedTime.end
          }));
        }
      }

      // Send to Laravel backend using apiClient
      const response = await apiClient.post('/register/tutor', backendData);
      const data = response.data;

      if (data.success) {
        toast({ 
          title: "Success", 
          description: data.message || "Tutor registration successful! Redirecting to login..." 
        });
        
        // Reset form
        setTutorForm({
          name: "", fatherName: "", email: "", password: "", password_confirmation: "", age: "", country: "", phoneCode: "", phone: "",
          city: "", subcity: "", sex: "", degree: "", status: "", experience: "", previousGrades: "",
          degreePhoto: null, specialty: "", specialtyArea: [], specialtyLanguages: [], 
          gradeRange: "", curriculum: "", availableDays: [], availableTimes: [], 
          tutoringMode: "", tutoringArea: "", address: ""
        });
        
        // Redirect to login page after successful registration
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        
      } else {
        // Handle validation errors
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          toast({ 
            title: "Validation Error", 
            description: Array.isArray(firstError) ? firstError[0] : "Please check your input",
            variant: "destructive" 
          });
        } else {
          toast({ 
            title: "Error", 
            description: data.message || "Registration failed",
            variant: "destructive" 
          });
        }
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle different error types
      if (error.response?.data) {
        const data = error.response.data;
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          toast({ 
            title: "Validation Error", 
            description: Array.isArray(firstError) ? firstError[0] : "Please check your input",
            variant: "destructive" 
          });
        } else {
          toast({ 
            title: "Error", 
            description: data.message || "Registration failed",
            variant: "destructive" 
          });
        }
      } else {
        toast({ 
          title: "Network Error", 
          description: "Cannot connect to server. Please try again.",
          variant: "destructive" 
        });
      }
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
      <h2 className="text-2xl font-semibold mb-4 text-center">Tutor Information</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="t-name">Name *</Label>
          <Input id="t-name" value={tutorForm.name} onChange={(e) => setTutorForm({...tutorForm, name: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="t-father">Father's Name *</Label>
          <Input id="t-father" value={tutorForm.fatherName} onChange={(e) => setTutorForm({...tutorForm, fatherName: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="t-email">Email *</Label>
          <Input id="t-email" type="email" value={tutorForm.email} onChange={(e) => setTutorForm({...tutorForm, email: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="t-age">Age *</Label>
          <Input id="t-age" type="number" min="18" max="100" value={tutorForm.age} onChange={(e) => setTutorForm({...tutorForm, age: e.target.value})} required />
        </div>
      </div>

      {/* Add Password Fields */}
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

      {/* Add Address Field */}
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
        <Label htmlFor="t-sex">Sex *</Label>
        <Select value={tutorForm.sex} onValueChange={(val) => setTutorForm({...tutorForm, sex: val})}>
          <SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="degree">Degree Level *</Label>
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

      <div className="space-y-2">
        <Label>Previous Tutoring Experience *</Label>
        <RadioGroup value={tutorForm.experience} onValueChange={(val) => setTutorForm({...tutorForm, experience: val, previousGrades: val === "no" ? "" : tutorForm.previousGrades})} className="flex gap-4">
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

      {tutorForm.experience === "yes" && (
        <div className="space-y-2 animate-fade-in">
          <Label htmlFor="prev-grades">Which Grade(s)? *</Label>
          <Input id="prev-grades" value={tutorForm.previousGrades} onChange={(e) => setTutorForm({...tutorForm, previousGrades: e.target.value})} placeholder="e.g., Grade 9-12" required />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="degree-photo">Upload Degree Photo *</Label>
        <div className="flex items-center gap-4">
          <Input
            id="degree-photo"
            type="file"
            accept="image/*"
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
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Teaching Specialization</h3>
        <div className="space-y-2">
          <Label>What is your speciality? *</Label>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { spec: "Programming", icon: Code },
              { spec: "Language", icon: Globe },
              { spec: "School Grades", icon: GraduationCap }
            ].map(item => (
              <div
                key={item.spec}
                onClick={() => setTutorForm({...tutorForm, specialty: item.spec, specialtyArea: [], specialtyLanguages: [], gradeRange: "", curriculum: ""})}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  tutorForm.specialty === item.spec ? "border-primary bg-gradient-primary text-primary-foreground shadow-glow" : "border-border hover:border-primary/50 bg-card"
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
            <Label>Select area(s) *</Label>
            <div className="grid grid-cols-3 gap-3">
              {["AI", "Web Development", "App Development"].map(area => (
                <Button
                  key={area}
                  type="button"
                  onClick={() => toggleItem(area, tutorForm.specialtyArea, (val) => setTutorForm({...tutorForm, specialtyArea: val}))}
                  variant={tutorForm.specialtyArea.includes(area) ? "default" : "outline"}
                  className="h-auto py-3"
                >
                  {area}
                </Button>
              ))}
            </div>
          </div>
        )}

        {tutorForm.specialty === "Language" && (
          <div className="space-y-3 animate-fade-in">
            <Label>Select language(s) *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {languages.map(lang => (
                <Button
                  key={lang}
                  type="button"
                  onClick={() => toggleItem(lang, tutorForm.specialtyLanguages, (val) => setTutorForm({...tutorForm, specialtyLanguages: val}))}
                  variant={tutorForm.specialtyLanguages.includes(lang) ? "default" : "outline"}
                  className="h-auto py-3"
                >
                  {lang}
                </Button>
              ))}
            </div>
          </div>
        )}

        {tutorForm.specialty === "School Grades" && (
          <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
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
        )}

        <div className="space-y-2">
          <Label>Available Days *</Label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map(day => (
              <Button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                variant={tutorForm.availableDays.includes(day) ? "default" : "outline"}
                size="sm"
              >
                {day.slice(0, 3)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Available Time *</Label>
          <RadioGroup value={tutorForm.availableTimes[0] || ""} onValueChange={(val) => setTutorForm({...tutorForm, availableTimes: [val]})} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {timeSlots.map(slot => (
              <div key={slot} className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent">
                <RadioGroupItem value={slot} id={`time-${slot}`} />
                <Label htmlFor={`time-${slot}`} className="cursor-pointer flex-1">{slot}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Enhanced Tutoring Mode Section */}
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
                  // Disable Home-to-Home if not in Addis Ababa
                  disabled={mode === "Home-to-Home" && tutorForm.city !== "Addis Ababa"}
                >
                  {mode}
                  {mode === "Home-to-Home" && tutorForm.city !== "Addis Ababa" && (
                    <span className="text-xs ml-2 opacity-70">(Addis only)</span>
                  )}
                </Button>
              ))}
            </div>
            
            {/* Show message when Home-to-Home is unavailable */}
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
            <input type="hidden" value="Online" />
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" variant="default" size="lg">
        Register as Tutor
      </Button>
    </form>
  );
};

export default TutorForm;