import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, LogOut, User } from "lucide-react";
import { DarkModeToggle } from "@/components/DarkModeToggle";

interface SidebarItem {
  title: string;
  value: string;
  icon: any;
  badge?: number;
}

interface UniversalSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onOpenMessages?: () => void;
  navigationItems: SidebarItem[];
  userRole: "student" | "tutor" | "admin" | "super_admin" | "staff";
  userName?: string;
  unreadMessages?: number;
  customFooter?: React.ReactNode;
}

export function UniversalSidebar({
  activeTab,
  onTabChange,
  onLogout,
  navigationItems,
  userRole,
  userName = "User",
  customFooter,
}: UniversalSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-foreground">
              TutorialHub
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.value)}
                    isActive={activeTab === item.value}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>{item.title}</span>
                        {item.badge && item.badge > 0 && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {customFooter && (
          <>
            <SidebarSeparator />
            {customFooter}
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          {/* Dark Mode Toggle */}
          <SidebarMenuItem>
            <div className="flex justify-center py-1">
              <DarkModeToggle />
            </div>
          </SidebarMenuItem>

          {/* User Info */}
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{userRole.replace('_', ' ')}</p>
                </div>
              )}
            </div>
          </SidebarMenuItem>

          {/* Logout Button */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              tooltip={isCollapsed ? "Logout" : undefined}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="text-destructive">Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}