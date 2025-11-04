import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const NotificationDropdown = () => {
  const notifications = [
    {
      id: 1,
      title: "New assignment posted",
      description: "Advanced Mathematics - Chapter 5 Problem Set",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      title: "Grade posted",
      description: "English Literature - Shakespeare Essay: 85/100",
      time: "5 hours ago",
      unread: true,
    },
    {
      id: 3,
      title: "Class announcement",
      description: "Physics Lab - Lab session moved to Friday",
      time: "1 day ago",
      unread: false,
    },
    {
      id: 4,
      title: "Assignment due soon",
      description: "Computer Science - Data Structures due tomorrow",
      time: "1 day ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
            >
              <div className="flex items-start justify-between w-full gap-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.description}
                  </p>
                </div>
                {notification.unread && (
                  <div className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0"></div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{notification.time}</span>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center justify-center text-sm text-primary cursor-pointer">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
