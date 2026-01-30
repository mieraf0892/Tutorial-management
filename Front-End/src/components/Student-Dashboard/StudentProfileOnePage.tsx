import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, MapPin, Save, Edit3, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function StudentProfileOnePage() {
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        age: "",
        sex: "",
        country: "",
        city: "",
        bio: "",
        interests: ""
    });

    const fetchProfile = async () => {
        try {
            const response = await apiClient.get("/student/profile");
            if (response.data.success) {
                setProfileData(response.data.profile);
                const s = response.data.profile.student;
                setFormData({
                    age: s?.age || "",
                    sex: s?.sex || "",
                    country: s?.country || "",
                    city: s?.city || "",
                    bio: s?.bio || "",
                    interests: s?.interests || ""
                });
            }
        } catch (error) {
            console.error("Failed to load profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await apiClient.put("/student/profile", formData);
            if (response.data.success) {
                toast({ title: "Profile updated successfully" });
                setEditing(false);
                fetchProfile(); // Refresh
            }
        } catch (error) {
            toast({ title: "Failed to update profile", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    }

    const { student } = profileData || {};

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
                    <p className="text-muted-foreground">Manage your personal information and preferences.</p>
                </div>
                <Button onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving}>
                    {editing ? (saving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2 w-4 h-4" />) : <Edit3 className="mr-2 w-4 h-4" />}
                    {editing ? (saving ? "Saving..." : "Save Changes") : "Edit Profile"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Basic Info */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Avatar className="w-32 h-32 mx-auto border-4 border-white shadow-xl mb-4">
                                <AvatarImage src={student?.profile_photo} />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                    {user?.name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <h3 className="text-xl font-bold">{user?.name}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
                            <div className="flex justify-center gap-2">
                                <Badge variant="outline" className="capitalize">{student?.course_type || "Student"}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Form/Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Personal Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Age</label>
                                {editing ? (
                                    <Input value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} type="number" />
                                ) : (
                                    <div className="p-2 bg-slate-50 rounded-md text-sm">{student?.age || "Not set"}</div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Gender</label>
                                {editing ? (
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.sex}
                                        onChange={e => setFormData({ ...formData, sex: e.target.value })}
                                    >
                                        <option value="">Select...</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                ) : (
                                    <div className="p-2 bg-slate-50 rounded-md text-sm capitalize">{student?.sex || "Not set"}</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Country</label>
                                {editing ? (
                                    <Input value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                                ) : (
                                    <div className="p-2 bg-slate-50 rounded-md text-sm">{student?.country || "Not set"}</div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">City</label>
                                {editing ? (
                                    <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                ) : (
                                    <div className="p-2 bg-slate-50 rounded-md text-sm">{student?.city || "Not set"}</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Bio & Interests
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bio</label>
                                {editing ? (
                                    <Textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                                ) : (
                                    <div className="p-2 bg-slate-50 rounded-md text-sm min-h-[60px]">{student?.bio || "No bio info"}</div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Interests (comma separated)</label>
                                {editing ? (
                                    <Input value={formData.interests} onChange={e => setFormData({ ...formData, interests: e.target.value })} />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {student?.interests ? student.interests.split(',').map((i: string, idx: number) => (
                                            <Badge key={idx} variant="secondary">{i.trim()}</Badge>
                                        )) : <span className="text-sm text-muted-foreground">No interests listed</span>}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
