import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Clock,
  DollarSign,
  Edit3,
  Save,
  Upload,
  Award,
  ArrowLeft,
  LayoutDashboard,
  Lock,
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TutorProfilePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [contactForm, setContactForm] = useState({ email: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/tutor/profile");
      if (response.data.success) {
        setProfileData(response.data.profile);
        setFormData(response.data.profile.tutor);
        setContactForm({
          email: response.data.profile.user?.email || "",
          phone: response.data.profile.user?.phone || "",
        });
      }
    } catch (error: any) {
      console.error("Profile fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put("/tutor/profile", formData);
      if (response.data.success) {
        setProfileData((prev: any) =>
          prev
            ? {
                ...prev,
                tutor: response.data.profile,
              }
            : null
        );
        setEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        fetchProfile(); // Refresh data
      }
    } catch (error: any) {
      console.error("Profile save error:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveContactInfo = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put("/tutor/profile/contact", contactForm);
      if (response.data.success) {
        setProfileData((prev: any) =>
          prev
            ? {
                ...prev,
                user: response.data.user,
              }
            : null
        );
        setEditingContact(false);
        toast({
          title: "Success",
          description: "Contact information updated",
        });
      }
    } catch (error: any) {
      console.error("Contact save error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update contact information",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    // Basic client-side validation
    if (!passwordForm.current_password) {
      toast({ title: "Error", description: "Current password is required", variant: "destructive" });
      return;
    }
    if (!passwordForm.new_password || passwordForm.new_password.length < 8) {
      toast({ title: "Error", description: "New password must be at least 8 characters", variant: "destructive" });
      return;
    }
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast({ title: "Error", description: "New password and confirmation do not match", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const response = await apiClient.put("/tutor/profile/password", passwordForm);
      if (response.data.success) {
        setPasswordForm({ current_password: "", new_password: "", new_password_confirmation: "" });
        setPasswordModalOpen(false);
        toast({ title: "Success", description: "Password changed successfully" });
      }
    } catch (error: any) {
      console.error("Password change error:", error);
      toast({ title: "Error", description: error.response?.data?.message || "Failed to change password", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Profile not found</p>
          <Button onClick={() => navigate("/tutor")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/tutor")} className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <div className="h-6 w-px bg-border"></div>
            <h1 className="text-2xl font-bold text-foreground">Tutor Profile</h1>
          </div>
          <Button onClick={() => setEditing(!editing)} variant={editing ? "secondary" : "outline"}>
            {editing ? <Save className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
            {editing ? "Save Profile" : "Edit Profile"}
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Header Card */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileData.tutor.profile_photo} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {profileData.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{profileData.user.name}</h1>
                  <p className="text-muted-foreground">{profileData.tutor.title || "Tutor"}</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    {profileData.tutor.headline || "Experienced tutor dedicated to student success"}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                    {profileData.tutor.city && profileData.tutor.country && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{profileData.tutor.city}, {profileData.tutor.country}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{profileData.tutor.experience_years || 0} years experience</span>
                    </div>
                    {profileData.tutor.hourly_rate && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>${profileData.tutor.hourly_rate}/hour</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{profileData.stats.total_tutorials}</div>
              <p className="text-sm text-muted-foreground">Tutorials</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{profileData.stats.total_students}</div>
              <p className="text-sm text-muted-foreground">Students</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{profileData.stats.completion_rate}%</div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{profileData.stats.average_rating}</div>
              <p className="text-sm text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* About Me */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5" />
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <Textarea 
                  value={formData.bio || ""} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                  placeholder="Tell students about yourself, your teaching style, and experience..." 
                  rows={6}
                  className="bg-background"
                />
              ) : (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {profileData.tutor.bio || "No bio provided yet. Tell students about your teaching experience and approach."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Qualifications */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <GraduationCap className="h-5 w-5" />
                Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-foreground">Qualification</label>
                    <Input 
                      value={formData.qualification || ""} 
                      onChange={(e) => setFormData({...formData, qualification: e.target.value})} 
                      placeholder="e.g., Masters in Computer Science" 
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-foreground">Experience (years)</label>
                    <Input 
                      type="number" 
                      value={formData.experience_years || ""} 
                      onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})} 
                      placeholder="Years of experience" 
                      min="0" 
                      max="50"
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-foreground">Hourly Rate ($)</label>
                    <Input 
                      type="number" 
                      value={formData.hourly_rate || ""} 
                      onChange={(e) => setFormData({...formData, hourly_rate: parseFloat(e.target.value) || 0})} 
                      placeholder="e.g., 50" 
                      min="0" 
                      step="0.01"
                      className="bg-background"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-medium text-foreground">Qualification</p>
                    <p className="text-muted-foreground">{profileData.tutor.qualification || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Experience</p>
                    <p className="text-muted-foreground">{profileData.tutor.experience_years || 0} years</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Hourly Rate</p>
                    <p className="text-muted-foreground">
                      {profileData.tutor.hourly_rate ? `$${profileData.tutor.hourly_rate}/hour` : "Not set"}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Location Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Location Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editing ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-foreground">Country</label>
                    <Input 
                      value={formData.country || ""} 
                      onChange={(e) => setFormData({...formData, country: e.target.value})} 
                      placeholder="e.g., Ethiopia" 
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-foreground">City</label>
                    <Input 
                      value={formData.city || ""} 
                      onChange={(e) => setFormData({...formData, city: e.target.value})} 
                      placeholder="e.g., Addis Ababa" 
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-foreground">Subcity</label>
                    <Input 
                      value={formData.subcity || ""} 
                      onChange={(e) => setFormData({...formData, subcity: e.target.value})} 
                      placeholder="e.g., Lideta" 
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-foreground">Address</label>
                    <Input 
                      value={formData.address || ""} 
                      onChange={(e) => setFormData({...formData, address: e.target.value})} 
                      placeholder="Your full address" 
                      className="bg-background"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Location</p>
                      <p className="text-muted-foreground">
                        {profileData.tutor.city && profileData.tutor.country ? `${profileData.tutor.city}, ${profileData.tutor.country}` : "Not specified"}
                      </p>
                    </div>
                  </div>
                  {profileData.tutor.subcity && (
                    <div>
                      <p className="font-medium text-foreground">Subcity</p>
                      <p className="text-muted-foreground">{profileData.tutor.subcity}</p>
                    </div>
                  )}
                  {profileData.tutor.address && (
                    <div className="md:col-span-2">
                      <p className="font-medium text-foreground">Address</p>
                      <p className="text-muted-foreground">{profileData.tutor.address}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-card border-border">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Mail className="h-5 w-5" /> Contact Information
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setPasswordModalOpen(true)}>
                <Lock className="h-4 w-4 mr-2" /> Change Password
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                {editing ? (
                  <Input 
                    type="email" 
                    value={contactForm.email} 
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})} 
                    placeholder="you@example.com" 
                    className="bg-background"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-2 bg-muted rounded">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{profileData.user.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone</label>
                {editing ? (
                  <Input 
                    type="tel" 
                    value={contactForm.phone} 
                    onChange={(e) => setContactForm({...contactForm, phone: e.target.value})} 
                    placeholder="+251 91 234 5678" 
                    className="bg-background"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-2 bg-muted rounded">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{profileData.user.phone || "Not provided"}</span>
                  </div>
                )}
              </div>
            </div>

            {editing && (
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setContactForm({ email: profileData.user.email || "", phone: profileData.user.phone || "" });
                }}>
                  Cancel
                </Button>
                <Button size="sm" onClick={saveContactInfo} disabled={saving}>
                  {saving ? "Saving..." : "Save Contact"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save/Cancel Buttons */}
        {editing && (
          <div className="flex justify-end gap-3 sticky bottom-6 bg-card p-4 rounded-lg border border-border shadow-lg">
            <Button variant="outline" onClick={() => { 
              setEditing(false); 
              setFormData(profileData.tutor); 
              setContactForm({ email: profileData.user.email || "", phone: profileData.user.phone || "" }); 
            }}>
              Cancel
            </Button>
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPasswordModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <Shield className="h-5 w-5" /> Change Password
              </h3>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setPasswordModalOpen(false)}>✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Current Password</label>
                <Input 
                  type="password" 
                  value={passwordForm.current_password} 
                  onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})} 
                  placeholder="Enter current password" 
                  className="bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">New Password</label>
                <Input 
                  type="password" 
                  value={passwordForm.new_password} 
                  onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})} 
                  placeholder="At least 8 characters" 
                  className="bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                <Input 
                  type="password" 
                  value={passwordForm.new_password_confirmation} 
                  onChange={(e) => setPasswordForm({...passwordForm, new_password_confirmation: e.target.value})} 
                  placeholder="Confirm new password" 
                  className="bg-background"
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => { 
                  setPasswordModalOpen(false); 
                  setPasswordForm({ current_password: "", new_password: "", new_password_confirmation: "" }); 
                }}>
                  Cancel
                </Button>
                <Button onClick={changePassword} disabled={saving}>
                  {saving ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}