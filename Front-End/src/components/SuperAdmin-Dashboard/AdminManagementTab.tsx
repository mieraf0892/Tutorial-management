// src/components/SuperAdmin-Dashboard/AdminManagementTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users, Shield, DollarSign, UserCheck, Search,
  MoreVertical, Edit, Trash2, Mail, Key, CheckCircle, XCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'financial_admin' | 'user_admin' | 'content_admin';
  permissions: string[];
  last_active: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface AdminManagementTabProps {
  admins: AdminUser[];
  onAdminUpdate: (action: string, data: any) => void;
}

export default function AdminManagementTab({ admins, onAdminUpdate }: AdminManagementTabProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'financial_admin': return 'bg-green-100 text-green-800';
      case 'user_admin': return 'bg-purple-100 text-purple-800';
      case 'content_admin': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'suspended': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const handleSuspendAdmin = (adminId: number) => {
    onAdminUpdate('suspend_admin', { adminId });
  };

  const handleActivateAdmin = (adminId: number) => {
    onAdminUpdate('activate_admin', { adminId });
  };

  const handleResetPassword = (adminId: number) => {
    onAdminUpdate('reset_password', { adminId });
  };

  const handleSendEmail = (adminId: number) => {
    onAdminUpdate('send_email', { adminId });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Admin Management</h2>
          <p className="text-gray-600">Manage all administrative roles and permissions</p>
        </div>
        <Button>
          <Users className="w-4 h-4 mr-2" />
          Add New Admin
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search admins..." className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin List */}
      <Card>
        <CardHeader>
          <CardTitle>Administrative Users</CardTitle>
          <CardDescription>
            {admins.length} administrative users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{admin.name}</h3>
                      {getStatusIcon(admin.status)}
                    </div>
                    <p className="text-sm text-gray-600">{admin.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className={getRoleColor(admin.role)}>
                        {admin.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Last active: {new Date(admin.last_active).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {admin.permissions.length} permissions
                    </p>
                    <p className="text-xs text-gray-500">
                      {admin.status === 'active' ? 'Active' : 
                       admin.status === 'inactive' ? 'Inactive' : 'Suspended'}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSendEmail(admin.id)}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResetPassword(admin.id)}>
                        <Key className="w-4 h-4 mr-2" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Permissions
                      </DropdownMenuItem>
                      {admin.status === 'active' ? (
                        <DropdownMenuItem 
                          onClick={() => handleSuspendAdmin(admin.id)}
                          className="text-red-600"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Suspend Admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => handleActivateAdmin(admin.id)}
                          className="text-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Activate Admin
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {admins.filter(a => a.role === 'admin').length}
            </p>
            <p className="text-sm text-gray-600">System Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {admins.filter(a => a.role === 'financial_admin').length}
            </p>
            <p className="text-sm text-gray-600">Financial Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {admins.filter(a => a.role === 'user_admin').length}
            </p>
            <p className="text-sm text-gray-600">User Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {admins.filter(a => a.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">Active Admins</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}