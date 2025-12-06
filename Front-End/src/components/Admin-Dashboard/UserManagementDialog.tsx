"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, UserPlus, Edit, Mail, Phone, Shield, User, BookOpen, ArrowLeft } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  created_at: string;
  avatar?: string;
}

interface UserManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated?: () => void;
}

export function UserManagementDialog({
  open,
  onOpenChange,
  onUserCreated
}: UserManagementDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUsers();
      resetForm();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await apiClient.get("/admin/users");
      if (response.data.success) {
        setUsers(response.data.users || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch users");
      }
    } catch (err: any) {
      console.error("Fetch users error:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Unable to fetch users.",
        variant: "destructive",
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleBackToList = () => {
    resetForm();
  };

  const handleFinished = () => {
    fetchUsers();
    resetForm();
    if (onUserCreated) {
      onUserCreated();
    }
  };

  const handleUserAction = async (action: string, userId: number) => {
    try {
      if (action === "suspend") {
        // Use the specific suspend endpoint
        const response = await apiClient.post(`/admin/users/${userId}/suspend`);
      
        if (response.data.success) {
          toast({
            title: "User Suspended",
            description: "User account has been suspended",
          });
        } else {
          throw new Error(response.data.message || "Failed to suspend user");
        }
      } else if (action === "activate") {
      // Use the specific activate endpoint
      const response = await apiClient.post(`/admin/users/${userId}/activate`);
      
        if (response.data.success) {
          toast({
            title: "User Activated",
            description: "User account has been activated",
          });
        } else {
          throw new Error(response.data.message || "Failed to activate user");
        }
      }
    
      // Refresh the user list
      fetchUsers();
    } catch (error: any) {
      console.error(`${action} error:`, error);
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${action} user`,
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter((u) =>
    [u.name, u.email, u.role].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-3 h-3 shrink-0" />;
      case 'tutor': return <User className="w-3 h-3 shrink-0" />;
      case 'student': return <BookOpen className="w-3 h-3 shrink-0" />;
      default: return <User className="w-3 h-3 shrink-0" />;
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
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0 pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            {showForm ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleBackToList}
                  className="h-6 w-6 mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                {editingUser ? 'Edit User' : 'Create User'}
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                User Management
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-6">
          {showForm ? (
            <UserForm
              mode={editingUser ? "edit" : "create"}
              user={editingUser}
              onFinished={handleFinished}
              onCancel={handleBackToList}
            />
          ) : (
            <>
              {/* Search and Actions Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, or role..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={fetchUsers}
                    disabled={usersLoading}
                    size="sm"
                    className="flex-1 sm:flex-none"
                  >
                    <Loader2 className={`w-4 h-4 mr-2 ${usersLoading ? 'animate-spin' : 'hidden'}`} />
                    Refresh
                  </Button>
                  <Button onClick={handleCreateUser} className="gap-2 flex-1 sm:flex-none" size="sm">
                    <UserPlus className="w-4 h-4" />
                    Add User
                  </Button>
                </div>
              </div>

              {/* User List */}
              <ScrollArea className="h-[60vh] min-h-[300px] max-h-[500px] border rounded-md">
                {usersLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {searchTerm ? "No users found" : "No users available"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm ? "Try adjusting your search terms." : "Get started by adding your first user."}
                    </p>
                    {!searchTerm && (
                      <Button onClick={handleCreateUser}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {filteredUsers.map((user) => (
                      <Card
                        key={user.id}
                        className="border hover:shadow-sm transition cursor-pointer"
                        onClick={() => handleEditUser(user)}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="space-y-2 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-foreground truncate">{user.name}</p>
                                <Badge variant={getStatusVariant(user.status)} className="capitalize text-xs shrink-0">
                                  {user.status}
                                </Badge>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1 min-w-0">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                                {user.phone && (
                                  <div className="flex items-center gap-1 min-w-0">
                                    <Phone className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{user.phone}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {getRoleIcon(user.role)}
                                <Badge variant="outline" className="capitalize text-xs shrink-0">
                                  {user.role}
                                </Badge>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  Joined: {new Date(user.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditUser(user);
                                }}
                                className="gap-1"
                              >
                                <Edit className="w-3 h-3" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUserAction(
                                    user.status === "active" ? "suspend" : "activate", 
                                    user.id
                                  );
                                }}
                              >
                                {user.status === "active" ? "Suspend" : "Activate"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Users Count */}
              {!usersLoading && filteredUsers.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Showing {filteredUsers.length} of {users.length} users
                    {searchTerm && ` matching "${searchTerm}"`}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// UserForm component remains the same...

/* --------------------------------------------------------
   USER FORM (CREATE + EDIT)
   -------------------------------------------------------- */

function UserForm({
  mode,
  user,
  onFinished,
  onCancel,
}: {
  mode: "create" | "edit";
  user?: User | null;
  onFinished: () => void;
  onCancel: () => void;
}) {
  const isEdit = mode === "edit";
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    role: user?.role ?? "student",
    password: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        const response = await apiClient.put(`/admin/users/${user!.id}`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          notes: formData.notes,
        });

        if (response.data.success) {
          toast({
            title: "User Updated",
            description: "User profile updated successfully.",
          });
          onFinished();
        } else {
          throw new Error(response.data.message || "Failed to update user");
        }
      } else {
        const response = await apiClient.post(`/admin/users`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password,
          notes: formData.notes,
        });

        if (response.data.success) {
          toast({
            title: "User Created",
            description: "New user added successfully.",
          });
          onFinished();
        } else {
          throw new Error(response.data.message || "Failed to create user");
        }
      }
    } catch (err: any) {
      console.error("User operation error:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Operation failed.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="Enter email address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="tutor">Tutor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!isEdit && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="password">Temporary Password *</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter temporary password"
            />
            <p className="text-xs text-muted-foreground">
              User will be asked to change this password on first login
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional information about this user..."
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" className="flex-1" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="flex-1" type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {isEdit ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}