// components/admin-dashboard/UsersTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Eye, Edit, MessageSquare, XCircle } from "lucide-react";

interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  status: string;
  avatar: string;
  lastActive: string;
  joinDate: string;
  classes: number;
}

interface UsersTabProps {
  users: User[];
  onAddUser: () => void;
}

export default function UsersTab({ users, onAddUser }: UsersTabProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage all platform users and their roles</CardDescription>
          </div>
          <Button onClick={onAddUser}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <UserItem key={user.id} user={user} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UserItem({ user }: { user: User }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white">
            {user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{user.name}</h3>
            <Badge 
              variant={user.status === "active" ? "default" : "secondary"} 
              className="capitalize text-xs"
            >
              {user.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{user.email}</p>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <span>Joined {user.joinDate}</span>
            <span>{user.classes} classes</span>
            <span>Last active: {user.lastActive}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="capitalize">
          {user.role}
        </Badge>
        <UserDropdownMenu />
      </div>
    </div>
  );
}

function UserDropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Eye className="w-4 h-4 mr-2" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="w-4 h-4 mr-2" />
          Edit User
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MessageSquare className="w-4 h-4 mr-2" />
          Send Message
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">
          <XCircle className="w-4 h-4 mr-2" />
          Deactivate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}