import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StudentProfile() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    age: "",
    sex: "",
    father_name: "",
    parent_email: "",
    country: "",
    city: "",
    address: "",
    bio: "",
    interests: ""
  });

  const [emailForm, setEmailForm] = useState({
    email: "",
    current_password: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  });

  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/student/profile");
      
      if (response.data.success) {
        setProfileData(response.data.profile);
        const student = response.data.profile.student;
        setFormData({
          age: student?.age || "",
          sex: student?.sex || "",
          father_name: student?.father_name || "",
          parent_email: student?.parent_email || "",
          country: student?.country || "",
          city: student?.city || "",
          address: student?.address || "",
          bio: student?.bio || "",
          interests: student?.interests || ""
        });
        setEmailForm({
          email: response.data.profile.user?.email || "",
          current_password: ""
        });
      } else {
        throw new Error("Failed to load profile");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load student profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put("/student/profile", formData);
      
      if (response.data.success) {
        setProfileData((prev: any) => ({
          ...prev,
          student: { ...prev.student, ...formData }
        }));
        setEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!emailForm.current_password) {
      toast({
        title: "Error",
        description: "Current password is required to change email",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.put("/student/profile/contact", {
        email: emailForm.email
      });
      
      if (response.data.success) {
        setProfileData((prev: any) => ({
          ...prev,
          user: { ...prev.user, email: emailForm.email }
        }));
        setEditingEmail(false);
        setEmailForm({ ...emailForm, current_password: "" });
        toast({
          title: "Success",
          description: "Email updated successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update email",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current_password) {
      toast({ 
        title: "Error", 
        description: "Current password is required", 
        variant: "destructive" 
      });
      return;
    }
    if (!passwordForm.new_password || passwordForm.new_password.length < 8) {
      toast({ 
        title: "Error", 
        description: "New password must be at least 8 characters", 
        variant: "destructive" 
      });
      return;
    }
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast({ 
        title: "Error", 
        description: "New password and confirmation do not match", 
        variant: "destructive" 
      });
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.put("/student/profile/password", passwordForm);
      
      if (response.data.success) {
        setPasswordForm({ 
          current_password: "", 
          new_password: "", 
          new_password_confirmation: "" 
        });
        setChangingPassword(false);
        setShowPassword(false);
        toast({ 
          title: "Success", 
          description: "Password changed successfully" 
        });
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to change password", 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const student = profileData?.student;
    setFormData({
      age: student?.age || "",
      sex: student?.sex || "",
      father_name: student?.father_name || "",
      parent_email: student?.parent_email || "",
      country: student?.country || "",
      city: student?.city || "",
      address: student?.address || "",
      bio: student?.bio || "",
      interests: student?.interests || ""
    });
    setEditing(false);
  };

  const handleCancelEmail = () => {
    setEmailForm({
      email: profileData?.user?.email || "",
      current_password: ""
    });
    setEditingEmail(false);
  };

  const handleCancelPassword = () => {
    setPasswordForm({ 
      current_password: "", 
      new_password: "", 
      new_password_confirmation: "" 
    });
    setChangingPassword(false);
    setShowPassword(false);
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const { user, student } = profileData || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Button variant="outline" onClick={() => navigate("/student")} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
          </div>
          
          <Button 
            onClick={editing ? handleSaveProfile : () => setEditing(true)}
            disabled={saving}
            variant={editing ? "default" : "outline"}
          >
            {editing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Profile"}
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-lg">
                    <AvatarImage src={student?.profile_photo || undefined} alt={user?.name} />
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {user?.name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-xl font-semibold mt-4">{user?.name}</h2>
                  <p className="text-gray-600">Student</p>
                  
                  {editing ? (
                    <div className="mt-4 space-y-3">
                      <div className="text-left">
                        <label className="text-sm font-medium text-gray-700">Bio</label>
                        <Textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          placeholder="Tell us about yourself..."
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      <div className="text-left">
                        <label className="text-sm font-medium text-gray-700">Interests</label>
                        <Input
                          value={formData.interests}
                          onChange={(e) => setFormData({...formData, interests: e.target.value})}
                          placeholder="Your interests..."
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2 text-sm">
                      {student?.bio && (
                        <p className="text-gray-600 text-center">{student.bio}</p>
                      )}
                      {student?.interests && (
                        <div className="flex flex-wrap gap-1 justify-center mt-2">
                          {student.interests.split(',').map((interest: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {interest.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Email & Password Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    {!editingEmail && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setEditingEmail(true)}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Change
                      </Button>
                    )}
                  </div>
                  
                  {editingEmail ? (
                    <div className="space-y-2">
                      <Input
                        type="email"
                        value={emailForm.email}
                        onChange={(e) => setEmailForm({...emailForm, email: e.target.value})}
                        placeholder="Enter new email"
                      />
                      <Input
                        type="password"
                        value={emailForm.current_password}
                        onChange={(e) => setEmailForm({...emailForm, current_password: e.target.value})}
                        placeholder="Current password for verification"
                      />
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCancelEmail}
                          disabled={saving}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSaveEmail}
                          disabled={saving}
                        >
                          <Save className="w-3 h-3 mr-1" />
                          {saving ? "Saving..." : "Save Email"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {user?.email}
                    </div>
                  )}
                </div>

                {/* Password Section */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    {!changingPassword && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setChangingPassword(true)}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Change
                      </Button>
                    )}
                  </div>
                  
                  {changingPassword ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={passwordForm.current_password}
                          onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                          placeholder="Current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={passwordForm.new_password}
                          onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                          placeholder="New password (min 8 characters)"
                        />
                      </div>
                      
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.new_password_confirmation}
                        onChange={(e) => setPasswordForm({...passwordForm, new_password_confirmation: e.target.value})}
                        placeholder="Confirm new password"
                      />
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCancelPassword}
                          disabled={saving}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleChangePassword}
                          disabled={saving}
                        >
                          <Save className="w-3 h-3 mr-1" />
                          {saving ? "Updating..." : "Update Password"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <Lock className="w-4 h-4 mr-2" />
                      ••••••••
                    </div>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2 pt-4 border-t">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {user?.phone || "Not provided"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Age</label>
                    {editing ? (
                      <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-900">{student?.age || "Not specified"}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    {editing ? (
                      <select
                        value={formData.sex}
                        onChange={(e) => setFormData({...formData, sex: e.target.value})}
                        className="w-full p-2 border rounded-md mt-1"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 capitalize">{student?.sex || "Not specified"}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Parent/Guardian</label>
                  {editing ? (
                    <Input
                      value={formData.father_name}
                      onChange={(e) => setFormData({...formData, father_name: e.target.value})}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-900">{student?.father_name || "Not specified"}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Parent Email</label>
                  {editing ? (
                    <Input
                      type="email"
                      value={formData.parent_email}
                      onChange={(e) => setFormData({...formData, parent_email: e.target.value})}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-900">{student?.parent_email || "Not specified"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Country</label>
                    {editing ? (
                      <Input
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-900">{student?.country || "Not specified"}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">City</label>
                    {editing ? (
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-900">{student?.city || "Not specified"}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  {editing ? (
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-900">{student?.address || "Not specified"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Save/Cancel Buttons for Profile */}
            {editing && (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}