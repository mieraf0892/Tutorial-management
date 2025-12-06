// components/admin-dashboard/UserProfileDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  Shield,
  MapPin,
  X
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  avatar?: string;
  lastActive?: string;
  joinDate?: string;
  classes?: number;
  // Additional profile fields
  bio?: string;
  location?: string;
  expertise?: string[];
  enrolledCourses?: string[];
  completedCourses?: number;
}

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserProfileDialog({ open, onOpenChange, user }: UserProfileDialogProps) {
  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'tutor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'suspended': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">User Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start gap-6 p-6 border rounded-lg bg-card">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage src={user.avatar || ''} alt={user.name} />
              <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-lg">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground truncate">{user.name}</h2>
                <Badge 
                  variant={getStatusVariant(user.status)} 
                  className="capitalize text-sm"
                >
                  {user.status}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                
                {user.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <Badge 
                    variant="outline" 
                    className={`capitalize ${getRoleColor(user.role)}`}
                  >
                    {user.role}
                  </Badge>
                </div>
              </div>

              {user.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account Information */}
            <Card className="border-border">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Account Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID:</span>
                    <span className="font-medium">#{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="font-medium">{user.joinDate || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Active:</span>
                    <span className="font-medium">{user.lastActive || 'Unknown'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card className="border-border">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Activity Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Classes:</span>
                    <span className="font-medium">{user.classes || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed Courses:</span>
                    <span className="font-medium">{user.completedCourses || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={getStatusVariant(user.status)} className="capitalize">
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          {user.location && (
            <Card className="border-border">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4" />
                  Location
                </h3>
                <p className="text-sm text-muted-foreground">{user.location}</p>
              </CardContent>
            </Card>
          )}

          {/* Expertise/Skills */}
          {user.expertise && user.expertise.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4" />
                  {user.role === 'tutor' ? 'Areas of Expertise' : 'Interests'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.expertise.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enrolled Courses */}
          {user.enrolledCourses && user.enrolledCourses.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4" />
                  Enrolled Courses
                </h3>
                <div className="space-y-2">
                  {user.enrolledCourses.map((course, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{course}</span>
                      <Badge variant="outline" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" className="flex-1">
              <Calendar className="w-4 h-4 mr-2" />
              View Activity
            </Button>
            <Button className="flex-1">
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}