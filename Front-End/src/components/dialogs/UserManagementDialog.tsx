import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus } from "lucide-react";

interface UserManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated?: () => void; // Add this line
}

export function UserManagementDialog({ 
  open, 
  onOpenChange, 
  onUserCreated // Add this parameter
}: UserManagementDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const users = [
    { id: 1, name: "Alice Johnson", role: "student", email: "alice@example.com", status: "active", classes: 5 },
    { id: 2, name: "Bob Smith", role: "tutor", email: "bob@example.com", status: "active", classes: 3 },
    { id: 3, name: "Carol White", role: "student", email: "carol@example.com", status: "pending", classes: 2 },
    { id: 4, name: "David Brown", role: "tutor", email: "david@example.com", status: "active", classes: 4 },
    { id: 5, name: "Eve Wilson", role: "student", email: "eve@example.com", status: "active", classes: 6 },
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = () => {
    // Simulate user creation
    console.log("Creating new user...");
    
    // Call the callback if provided
    if (onUserCreated) {
      onUserCreated();
    }
    
    // You might want to keep the dialog open or close it
    // onOpenChange(false); // Uncomment if you want to close after creation
  };

  const handleUserAction = (action: string, userId: number) => {
    console.log(`${action} user ${userId}`);
    
    // If it's a create/edit action that modifies data, call the callback
    if (action === "edit" || action === "create") {
      if (onUserCreated) {
        onUserCreated();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-2xl">User Management</DialogTitle>
          <DialogDescription>Manage all users on the platform</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="gap-2" onClick={handleAddUser}>
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>

          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-border transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white font-medium text-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{user.classes} classes</p>
                    <Badge variant={user.status === "active" ? "default" : "secondary"} className="capitalize">
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUserAction("edit", user.id)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleUserAction("suspend", user.id)}
                    >
                      Suspend
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}