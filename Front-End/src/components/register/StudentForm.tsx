"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Code, Globe, GraduationCap, BookOpen, PersonStanding, Users } from "lucide-react";
import { apiClient } from "@/lib/api";

// Import shared constants (you might want to move these to a separate constants file)
const countries = ["Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia", "Denmark", "Egypt", "Ethiopia", "Finland", "France", "Germany", "Ghana", "Greece", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Jordan", "Kenya", "Lebanon", "Malaysia", "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", "Syria", "Thailand", "Turkey", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Venezuela", "Vietnam", "Yemen"];
const ethiopianCities = ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Hawassa", "Bahir Dar", "Jimma", "Adama", "Dessie", "Jijiga"];
const addisAbabaSubcities = ["Addis Ketema", "Akaky Kaliti", "Arada", "Bole", "Gullele", "Kirkos", "Kolfe Keranio", "Lideta", "Nifas Silk-Lafto", "Yeka", "Lemi Kura"];
const phoneCodes: Record<string, string> = { "Ethiopia": "+251", "United States": "+1", "United Kingdom": "+44", "Canada": "+1", "Australia": "+61", "Germany": "+49", "France": "+33", "India": "+91", "China": "+86", "Japan": "+81", "Brazil": "+55", "Mexico": "+52", "Spain": "+34", "Italy": "+39", "Netherlands": "+31", "Sweden": "+46", "Norway": "+47", "Denmark": "+45", "Finland": "+358", "Russia": "+7", "South Korea": "+82", "Singapore": "+65", "Saudi Arabia": "+966", "United Arab Emirates": "+971", "Egypt": "+20", "Nigeria": "+234", "Kenya": "+254", "South Africa": "+27" };

const StudentForm = () => {
  const [studentForm, setStudentForm] = useState({
    name: "", fatherName: "", email: "", age: "", country: "", phoneCode: "", phone: "", password: "", passwordConfirm: "",
    city: "", subcity: "", address: "", parentEmail: "", sex: "", courseType: "", 
    selectedArea: [] as string[], selectedLanguages: [] as string[], selectedGrade: "",
    selectedCurriculum: "", selectedSubjects: [] as string[], selectedExam: "",
    learningMode: "", learningPreference: "",
    studyDays: [] as string[], hoursPerDay: ""
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const programmingAreas = ["AI 🧠", "Web 💻", "App 📱"];
  const languages = ["Amharic 🇪🇹", "English 🇬🇧", "Afan Oromo 🇪🇹", "Chinese 🇨🇳", "Arabic 🇸🇦", "French 🇫🇷"];
  const nationalSubjects = ["Math", "Physics", "Chemistry", "Biology", "English", "Amharic", "Social Studies"];
  const internationalSubjects = ["Math", "Physics", "Chemistry", "Biology", "English Language", "World History", "Geography"];
  const exams = ["Grade 12", "SAT", "TOEFL", "IELTS"];

  const toggleDay = (day: string) => {
    setStudentForm(prev => ({
      ...prev,
      studyDays: prev.studyDays.includes(day)
        ? prev.studyDays.filter(d => d !== day)
        : [...prev.studyDays, day]
    }));
  };

  const toggleItem = (item: string, array: string[], setter: (val: string[]) => void) => {
    setter(array.includes(item) ? array.filter(i => i !== item) : [...array, item]);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentForm.courseType) {
      toast({ title: "Error", description: "Please select what you want to learn", variant: "destructive" });
      return;
    }

    if (studentForm.password !== studentForm.passwordConfirm) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    try {
      // Prepare the data for backend
      const formData = {
        // User data
        name: studentForm.name,
        email: studentForm.email,
        password: studentForm.password,
        password_confirmation: studentForm.passwordConfirm,
        
        // Student personal information
        fatherName: studentForm.fatherName,
        age: parseInt(studentForm.age),
        parentEmail: studentForm.parentEmail,
        sex: studentForm.sex,
        country: studentForm.country,
        phoneCode: studentForm.phoneCode,
        phone: studentForm.phone,
        city: studentForm.city,
        subcity: studentForm.subcity,
        address: studentForm.address,
        
        // Course type
        courseType: studentForm.courseType,
        
        // Learning preferences
        learningPreference: studentForm.learningPreference,
        studyDays: studentForm.studyDays,
        hoursPerDay: studentForm.hoursPerDay,
        learningMode: studentForm.learningMode,
        
        // Course-specific data
        selectedArea: studentForm.selectedArea,
        selectedLanguages: studentForm.selectedLanguages,
        selectedGrade: studentForm.selectedGrade,
        selectedCurriculum: studentForm.selectedCurriculum,
        selectedSubjects: studentForm.selectedSubjects,
        selectedExam: studentForm.selectedExam,
      };

      // Send to Laravel backend using apiClient
      const response = await apiClient.post('/register/student', formData);
      const data = response.data;

      if (data.success) {
        toast({ 
          title: "Success", 
          description: data.message || "Student registration successful! Redirecting to login..." 
        });
        
        // Reset form
        setStudentForm({
          name: "", fatherName: "", email: "", age: "", country: "", phoneCode: "", phone: "",
          city: "", subcity: "", address: "", parentEmail: "", sex: "", courseType: "",
          selectedArea: [], selectedLanguages: [], selectedGrade: "", selectedCurriculum: "",
          selectedSubjects: [], selectedExam: "", learningMode: "", learningPreference: "",
          studyDays: [], hoursPerDay: "", password: "", passwordConfirm:""
        });
        
        // Redirect to login page after successful registration
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        
      } else {
        // Handle validation errors from backend
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

  return (
    <form onSubmit={handleStudentSubmit} className="bg-card rounded-lg shadow-elegant p-8 space-y-6 border border-border">
      <h2 className="text-2xl font-semibold mb-4 text-center">Student Information</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="s-name">Name *</Label>
          <Input id="s-name" value={studentForm.name} onChange={(e) => setStudentForm({...studentForm, name: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-father">Father's Name *</Label>
          <Input id="s-father" value={studentForm.fatherName} onChange={(e) => setStudentForm({...studentForm, fatherName: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-email">Email *</Label>
          <Input id="s-email" type="email" value={studentForm.email} onChange={(e) => setStudentForm({...studentForm, email: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-age">Age *</Label>
          <Input id="s-age" type="number" min="1" max="100" value={studentForm.age} onChange={(e) => setStudentForm({...studentForm, age: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-password">Password *</Label>
          <Input 
            id="s-password" 
            type="password" 
            value={studentForm.password} 
            onChange={(e) => setStudentForm({...studentForm, password: e.target.value})} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-password-confirm">Confirm Password *</Label>
          <Input 
            id="s-password-confirm" 
            type="password" 
            value={studentForm.passwordConfirm} 
            onChange={(e) => setStudentForm({...studentForm, passwordConfirm: e.target.value})} 
            required 
          />
        </div>
      </div>

      {parseInt(studentForm.age) < 15 && studentForm.age && (
        <div className="space-y-2 animate-fade-in">
          <Label htmlFor="s-parent-email">Parent's Email *</Label>
          <Input id="s-parent-email" type="email" value={studentForm.parentEmail} onChange={(e) => setStudentForm({...studentForm, parentEmail: e.target.value})} required />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="s-country">Country *</Label>
          <Select value={studentForm.country} onValueChange={(val) => setStudentForm({...studentForm, country: val, phoneCode: phoneCodes[val] || "+1"})}>
            <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
            <SelectContent className="max-h-60">{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-phone">Phone Number *</Label>
          <div className="flex gap-2">
            <Input className="w-24" value={studentForm.phoneCode} readOnly placeholder="+1" />
            <Input id="s-phone" type="tel" value={studentForm.phone} onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})} required />
          </div>
        </div>
      </div>

      {studentForm.country === "Ethiopia" && (
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="s-city">City *</Label>
            <Select value={studentForm.city} onValueChange={(val) => setStudentForm({...studentForm, city: val, subcity: ""})}>
              <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
              <SelectContent>{ethiopianCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {studentForm.city === "Addis Ababa" && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="s-subcity">Subcity *</Label>
              <Select value={studentForm.subcity} onValueChange={(val) => setStudentForm({...studentForm, subcity: val})}>
                <SelectTrigger><SelectValue placeholder="Select subcity" /></SelectTrigger>
                <SelectContent>{addisAbabaSubcities.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="s-address">Address *</Label>
            <Input id="s-address" value={studentForm.address} onChange={(e) => setStudentForm({...studentForm, address: e.target.value})} required />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Sex *</Label>
        <RadioGroup value={studentForm.sex} onValueChange={(val) => setStudentForm({...studentForm, sex: val})} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="s-male" />
            <Label htmlFor="s-male" className="cursor-pointer">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="s-female" />
            <Label htmlFor="s-female" className="cursor-pointer">Female</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">What do you want to learn?</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { type: "Programming", icon: Code, desc: "Learn to code and build projects" },
            { type: "Language", icon: Globe, desc: "Become fluent in a new language" },
            { type: "School Grades", icon: GraduationCap, desc: "Get help with your schoolwork" },
            { type: "Entrance Preparation", icon: BookOpen, desc: "Prepare for entrance exams" }
          ].map(course => (
            <div
              key={course.type}
              onClick={() => setStudentForm({...studentForm, courseType: course.type, selectedArea: [], selectedLanguages: [], selectedGrade: "", selectedCurriculum: "", selectedSubjects: [], selectedExam: ""})}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow ${
                studentForm.courseType === course.type ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-border hover:border-primary/50 bg-card"
              }`}
            >
              <course.icon className="w-10 h-10 mb-3 mx-auto" />
              <p className="font-bold text-center text-lg mb-1">{course.type}</p>
              <p className={`text-sm text-center ${studentForm.courseType === course.type ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{course.desc}</p>
            </div>
          ))}
        </div>

        {/* Dynamic Content 1 - Based on Course Type */}
        {studentForm.courseType === "Programming" && (
          <div className="space-y-3 animate-fade-in">
            <Label>Which area? *</Label>
            <div className="flex gap-3">
              {programmingAreas.map(area => (
                <Button
                  key={area}
                  type="button"
                  onClick={() => toggleItem(area, studentForm.selectedArea, (val) => setStudentForm({...studentForm, selectedArea: val}))}
                  variant={studentForm.selectedArea.includes(area) ? "default" : "outline"}
                  className="flex-1 h-auto py-3"
                >
                  {area}
                </Button>
              ))}
            </div>
          </div>
        )}

        {studentForm.courseType === "Language" && (
          <div className="space-y-3 animate-fade-in">
            <Label>Which Language? *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {languages.map(lang => (
                <Button
                  key={lang}
                  type="button"
                  onClick={() => toggleItem(lang, studentForm.selectedLanguages, (val) => setStudentForm({...studentForm, selectedLanguages: val}))}
                  variant={studentForm.selectedLanguages.includes(lang) ? "default" : "outline"}
                  className="h-auto py-3"
                >
                  {lang}
                </Button>
              ))}
            </div>
          </div>
        )}

        {studentForm.courseType === "School Grades" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">What Grade are you in? *</Label>
                <Select value={studentForm.selectedGrade} onValueChange={(val) => setStudentForm({...studentForm, selectedGrade: val})}>
                  <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 12}, (_, i) => i + 1).map(g => <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="curriculum">Curriculum *</Label>
                <Select value={studentForm.selectedCurriculum} onValueChange={(val) => setStudentForm({...studentForm, selectedCurriculum: val, selectedSubjects: []})}>
                  <SelectTrigger><SelectValue placeholder="Select curriculum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">National Curriculum</SelectItem>
                    <SelectItem value="international">International Curriculum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {studentForm.selectedGrade && studentForm.selectedCurriculum && (
              <div className="space-y-2 animate-fade-in">
                <Label>Select your subjects *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(studentForm.selectedCurriculum === "national" ? nationalSubjects : internationalSubjects).map(subject => (
                    <Button
                      key={subject}
                      type="button"
                      onClick={() => toggleItem(subject, studentForm.selectedSubjects, (val) => setStudentForm({...studentForm, selectedSubjects: val}))}
                      variant={studentForm.selectedSubjects.includes(subject) ? "default" : "outline"}
                      size="sm"
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {studentForm.courseType === "Entrance Preparation" && (
          <div className="space-y-3 animate-fade-in">
            <Label>Which Exam? *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {exams.map(exam => (
                <Button
                  key={exam}
                  type="button"
                  onClick={() => setStudentForm({...studentForm, selectedExam: exam})}
                  variant={studentForm.selectedExam === exam ? "default" : "outline"}
                  className="h-auto py-3"
                >
                  {exam}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Content 2 - Learning Mode (Only for Addis Ababa) */}
        {studentForm.courseType && studentForm.city === "Addis Ababa" && (
          <div className="space-y-3 animate-fade-in">
            <Label>How do you want to learn? *</Label>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { mode: "Online", icon: "🌐", desc: "Learn remotely from anywhere" },
                { mode: "Home to Home", icon: "🏠", desc: "In-person tutoring at home" }
              ].map(option => (
                <div
                  key={option.mode}
                  onClick={() => setStudentForm({...studentForm, learningMode: option.mode})}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    studentForm.learningMode === option.mode ? "border-primary bg-primary/10 shadow-md" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-4xl text-center mb-2">{option.icon}</div>
                  <p className="font-semibold text-center mb-1">{option.mode}</p>
                  <p className="text-sm text-center text-muted-foreground">{option.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Content 3 - Learning Preference */}
        {studentForm.courseType && (
          <div className="space-y-3 animate-fade-in">
            <Label>Learning Preference *</Label>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { pref: "Individual", icon: PersonStanding, desc: "One-on-one personalized learning" },
                { pref: "Group", icon: Users, desc: "Learn together with others" }
              ].map(option => (
                <div
                  key={option.pref}
                  onClick={() => setStudentForm({...studentForm, learningPreference: option.pref})}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    studentForm.learningPreference === option.pref ? "border-primary bg-primary/10 shadow-md" : "border-border hover:border-primary/50"
                  }`}
                >
                  <option.icon className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-semibold text-center mb-1">{option.pref}</p>
                  <p className="text-sm text-center text-muted-foreground">{option.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Study Days *</Label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map(day => (
              <Button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                variant={studentForm.studyDays.includes(day) ? "default" : "outline"}
                size="sm"
              >
                {day.slice(0, 3)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hours">Hours Per Day *</Label>
          <Select value={studentForm.hoursPerDay} onValueChange={(val) => setStudentForm({...studentForm, hoursPerDay: val})}>
            <SelectTrigger><SelectValue placeholder="Select hours" /></SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map(h => <SelectItem key={h} value={h.toString()}>{h} hour{h > 1 ? 's' : ''}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full" variant="default" size="lg">
        Register as Student
      </Button>
    </form>
  );
};

export default StudentForm;