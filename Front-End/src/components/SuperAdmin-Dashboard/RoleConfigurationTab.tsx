// src/components/SuperAdmin-Dashboard/RoleConfigurationTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Key, Users, DollarSign, Shield, BookOpen, Settings,
  Save, Plus, Trash2, Edit
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isCustom: boolean;
}

interface RoleConfigurationTabProps {
  onRoleUpdate: (action: string, data: any) => void;
}

export default function RoleConfigurationTab({ onRoleUpdate }: RoleConfigurationTabProps) {
  // Default system roles
  const systemRoles: Role[] = [
    {
      id: 'super_admin',
      name: 'Super Administrator',
      description: 'Full system access and control',
      permissions: ['*'],
      userCount: 1,
      isCustom: false
    },
    {
      id: 'admin',
      name: 'System Administrator',
      description: 'General system administration',
      permissions: ['user_management', 'content_management', 'analytics'],
      userCount: 3,
      isCustom: false
    },
    {
      id: 'financial_admin',
      name: 'Financial Administrator',
      description: 'Financial reporting and payout management',
      permissions: ['financial_reports', 'payout_approval', 'revenue_analytics'],
      userCount: 2,
      isCustom: false
    },
    {
      id: 'user_admin',
      name: 'User Administrator',
      description: 'User management and role assignment',
      permissions: ['user_management', 'role_assignment', 'user_analytics'],
      userCount: 2,
      isCustom: false
    },
    {
      id: 'content_admin',
      name: 'Content Administrator',
      description: 'Content and course management',
      permissions: ['content_management', 'course_approval', 'content_analytics'],
      userCount: 1,
      isCustom: false
    }
  ];

  const permissions = [
    { id: 'user_management', name: 'User Management', description: 'Manage users and profiles' },
    { id: 'role_assignment', name: 'Role Assignment', description: 'Assign roles to users' },
    { id: 'financial_reports', name: 'Financial Reports', description: 'View and manage financial reports' },
    { id: 'payout_approval', name: 'Payout Approval', description: 'Approve tutor payouts' },
    { id: 'content_management', name: 'Content Management', description: 'Manage courses and content' },
    { id: 'course_approval', name: 'Course Approval', description: 'Approve new courses' },
    { id: 'system_settings', name: 'System Settings', description: 'Modify system configuration' },
    { id: 'analytics', name: 'Analytics Access', description: 'View system analytics' },
    { id: 'database_access', name: 'Database Access', description: 'Access database operations' },
    { id: 'security_settings', name: 'Security Settings', description: 'Manage security configurations' }
  ];

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'super_admin': return Shield;
      case 'admin': return Settings;
      case 'financial_admin': return DollarSign;
      case 'user_admin': return Users;
      case 'content_admin': return BookOpen;
      default: return Key;
    }
  };

  const handlePermissionToggle = (roleId: string, permissionId: string, enabled: boolean) => {
    onRoleUpdate('update_permission', { roleId, permissionId, enabled });
  };

  const handleCreateRole = () => {
    onRoleUpdate('create_role', { name: 'New Custom Role', permissions: [] });
  };

  const handleDeleteRole = (roleId: string) => {
    onRoleUpdate('delete_role', { roleId });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Role Configuration</h2>
          <p className="text-gray-600">Configure user roles and permissions across the system</p>
        </div>
        <Button onClick={handleCreateRole}>
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Role
        </Button>
      </div>

      {/* System Roles Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Roles</CardTitle>
          <CardDescription>Pre-defined system roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemRoles.map((role) => {
              const RoleIcon = getRoleIcon(role.id);
              return (
                <div key={role.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <RoleIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{role.name}</h3>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">
                        {role.userCount} users
                      </Badge>
                      {role.isCustom && (
                        <Button variant="outline" size="sm" onClick={() => handleDeleteRole(role.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Permissions for this role */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <Label htmlFor={`${role.id}-${permission.id}`} className="font-medium">
                            {permission.name}
                          </Label>
                          <p className="text-xs text-gray-600">{permission.description}</p>
                        </div>
                        <Switch
                          id={`${role.id}-${permission.id}`}
                          checked={role.permissions.includes('*') || role.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => handlePermissionToggle(role.id, permission.id, checked)}
                          disabled={role.id === 'super_admin' || !role.isCustom}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Role Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Key className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Role Audit</h3>
            <p className="text-sm text-gray-600 mb-4">Review role assignments and permissions</p>
            <Button variant="outline" size="sm">
              Run Audit
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">User Assignments</h3>
            <p className="text-sm text-gray-600 mb-4">Manage user role assignments</p>
            <Button variant="outline" size="sm">
              View Assignments
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Security Review</h3>
            <p className="text-sm text-gray-600 mb-4">Review role security settings</p>
            <Button variant="outline" size="sm">
              Security Check
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}