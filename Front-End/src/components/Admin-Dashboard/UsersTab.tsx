import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, Plus, MoreVertical, Eye, Edit, MessageSquare, XCircle, RefreshCw, Filter } from "lucide-react";
import { useState } from "react";

import { UserProfileDialog } from "./UserProfileDialog";
import { EditUserDialog } from "./EditUserDialog";
import { SendMessageDialog } from "./SendMessageDialog";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  status: string;
  avatar?: string;
  lastActive?: string;
  joinDate?: string;
  classes?: number;
}

interface UsersTabProps {
  users: User[];
  onAddUser: () => void;
  searchQuery: string;
  onRefresh?: () => void;
}

type RoleFilter = 'all' | 'admin' | 'student' | 'tutor';
type StatusFilter = 'all' | 'active' | 'suspended';

export default function UsersTab({ users, onAddUser, searchQuery, onRefresh }: UsersTabProps) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const { toast } = useToast();

  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Role filter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleCount = (role: RoleFilter) => {
    if (role === 'all') return users.length;
    return users.filter(user => user.role === role).length;
  };

  const getStatusCount = (status: StatusFilter) => {
    if (status === 'all') return users.length;
    return users.filter(user => user.status === status).length;
  };

  const clearFilters = () => {
    setRoleFilter('all');
    setStatusFilter('all');
    setShowFilters(false);
  };

   const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setShowProfileDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleSendMessage = (user: User) => {
    setSelectedUser(user);
    setShowMessageDialog(true);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const action = user.status === "active" ? "suspend" : "activate";
      const response = await apiClient.post(`/admin/users/${user.id}/${action}`);
      
      if (response.data.success) {
        toast({
          title: `User ${action === 'suspend' ? 'Suspended' : 'Activated'}`,
          description: `User account has been ${action === 'suspend' ? 'suspended' : 'activated'}`,
        });
        if (onRefresh) onRefresh();
      } else {
        throw new Error(response.data.message || `Failed to ${action} user`);
      }
    } catch (error: any) {
      console.error("Toggle status error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleUserUpdated = () => {
    if (onRefresh) onRefresh();
  };

  const hasActiveFilters = roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex justify-end">
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="bg-card hover:bg-accent border-border"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 bg-background/50 text-xs">
              {getRoleCount(roleFilter) + getStatusCount(statusFilter) - users.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="border border-border bg-accent/50">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Role Filter */}
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground mb-3">Filter by Role</h4>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'admin', 'tutor', 'student'] as RoleFilter[]).map((role) => (
                    <Button
                      key={role}
                      variant={roleFilter === role ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRoleFilter(role)}
                      className={`text-xs ${
                        roleFilter === role 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-card hover:bg-accent border-border'
                      }`}
                    >
                      {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                      <Badge 
                        variant="secondary" 
                        className="ml-2 bg-background/50 text-xs"
                      >
                        {getRoleCount(role)}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground mb-3">Filter by Status</h4>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'active', 'suspended'] as StatusFilter[]).map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className={`text-xs ${
                        statusFilter === status 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-card hover:bg-accent border-border'
                      } ${
                        status === 'suspended' && statusFilter !== status 
                          ? 'text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20' 
                          : ''
                      }`}
                    >
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                      <Badge 
                        variant="secondary" 
                        className="ml-2 bg-background/50 text-xs"
                      >
                        {getStatusCount(status)}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Active filters:</span>
                {roleFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Role: {roleFilter}
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Status: {statusFilter}
                  </Badge>
                )}
                {!hasActiveFilters && (
                  <span className="text-muted-foreground">No filters applied</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFilters(false)}
                  className="text-xs h-7 hover:bg-accent"
                >
                  Hide filters
                </Button>
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-xs h-7 hover:bg-accent"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List Card */}
      <Card className="border border-border shadow-sm bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-foreground">User Management</CardTitle>
              <CardDescription>Manage all platform users and their roles</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onRefresh && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onRefresh}
                  className="flex-1 sm:flex-none bg-card hover:bg-accent border-border"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              )}
              <Button onClick={onAddUser} className="flex-1 sm:flex-none">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || hasActiveFilters 
                  ? "No users match your search criteria or filters." 
                  : "Get started by adding your first user."
                }
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline" className="mr-2">
                  Clear filters
                </Button>
              )}
              <Button onClick={onAddUser}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <UserItem key={user.id} user={user} onViewProfile={handleViewProfile} onEditUser={handleEditUser} onSendMessage={handleSendMessage}
    onToggleStatus={handleToggleStatus}/>
              ))}
            </div>
          )}
          
          {/* Users Count */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
              {searchQuery && ` matching "${searchQuery}"`}
              {hasActiveFilters && ` with applied filters`}
            </p>
          </div>
        </CardContent>
      </Card>
      {/* User Profile Dialog */}
      <UserProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        user={selectedUser}
      />

       {/* Edit User Dialog */}
      <EditUserDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />

      <SendMessageDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        user={selectedUser}
      />
    </div>
  );
}

function UserItem({ user, onViewProfile,  onEditUser, onSendMessage, onToggleStatus }: { user: User; onViewProfile: (user: User) => void; onEditUser: (user: User) => void;
  onSendMessage: (user: User) => void; onToggleStatus: (user: User) => void; }) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'tutor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors bg-card gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage src={user.avatar || ''} alt={user.name} />
          <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white">
            {user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-medium text-foreground truncate">{user.name}</h3>
            <Badge 
              variant={getStatusVariant(user.status)} 
              className="capitalize text-xs shrink-0"
            >
              {user.status || 'active'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              Joined {user.joinDate || 'Unknown'}
            </span>
            <span className="flex items-center gap-1">
              {user.classes || 0} classes
            </span>
            <span className="flex items-center gap-1">
              Last active: {user.lastActive || 'Unknown'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Badge 
          variant="outline" 
          className={`capitalize border ${getRoleColor(user.role)}`}
        >
          {user.role}
        </Badge>
        <UserDropdownMenu user={user} onViewProfile={onViewProfile} onEditUser={onEditUser} onSendMessage={onSendMessage}
          onToggleStatus={onToggleStatus}/>
      </div>
    </div>
  );
}

function UserDropdownMenu({ user, onViewProfile, onEditUser, onSendMessage, onToggleStatus }: { user: User; onViewProfile: (user: User) => void ; onEditUser: (user: User) => void;
  onSendMessage: (user: User) => void; onToggleStatus: (user: User) => void;}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-accent">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <DropdownMenuItem 
          className="text-foreground hover:bg-accent cursor-pointer"
           onClick={() => onViewProfile(user)}
           >
          <Eye className="w-4 h-4 mr-2" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-foreground hover:bg-accent cursor-pointer"
          onClick={() => onEditUser(user)}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit User
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-foreground hover:bg-accent cursor-pointer"
          onClick={() => onSendMessage(user)}
          >
          <MessageSquare className="w-4 h-4 mr-2" />
          Send Message
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={`cursor-pointer ${
            user.status === 'suspended' 
              ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20' 
              : 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
           onClick={() => onToggleStatus(user)}
        >
          <XCircle className="w-4 h-4 mr-2" />
          {user.status === 'suspended' ? 'Activate' : 'Suspend'} 
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}