// components/ProfessionalMessageDialog.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Loader2, Send, User, Mail, MessageSquare, AlertTriangle, Users, FileText,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
}

interface Message {
  id: number;
  message: string;
  sender_id: number;
  sender_name: string;
  receiver_id: number;
  receiver_name: string;
  is_own_message: boolean;
  timestamp: string;
  is_read: boolean;
}

interface AnnouncementTemplate {
  id: number;
  name: string;
  title: string;
  message: string;
  suggested_target_type: string;
  suggested_priority: string;
  usage_count: number;
}

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

type TargetType = 'all' | 'roles' | 'specific' | 'filtered';
type Priority = 'low' | 'normal' | 'high' | 'urgent';

export function SendMessageDialog({
  open,
  onOpenChange,
  user
}: SendMessageDialogProps) {
  const [activeTab, setActiveTab] = useState<"direct" | "announcement" | "templates">("direct");
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<AnnouncementTemplate[]>([]);
  
  // Direct message state
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [priority, setPriority] = useState<Priority>('normal');
  const [targetType, setTargetType] = useState<TargetType>('all');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
  const [recipientCount, setRecipientCount] = useState(0);
  const [isScheduled, setIsScheduled] = useState(false);
  const [sendAt, setSendAt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const announcementScrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Reset when dialog opens
  useEffect(() => {
    if (open && user) {
      setNewMessage("");
      setActiveTab("direct");
      fetchMessages();
      fetchTemplates();
    }
  }, [open, user]);

  // Auto-scroll to bottom for messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Real-time recipient count calculation
  useEffect(() => {
    if (activeTab === "announcement") {
      calculateRecipientCount();
    }
  }, [targetType, selectedRoles, selectedUsers, activeTab]);

  const fetchMessages = async () => {
    if (!user) return;

    setMessagesLoading(true);
    try {
      const response = await apiClient.get(`/messages/${user.id}`);
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (err: any) {
      console.error("Fetch messages error:", err);
      toast({
        title: "Error",
        description: "Failed to load message history",
        variant: "destructive",
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await apiClient.get("/admin/announcement-templates");
      if (response.data.success) {
        setTemplates(response.data.data || []);
      }
    } catch (err: any) {
      console.error("Fetch templates error:", err);
    }
  };

  const calculateRecipientCount = useCallback(async () => {
  try {
    const payload = {
      target_type: targetType,
      target_roles: selectedRoles,
      target_users: selectedUsers.map(u => u.id),
    };

    console.log('Calculating recipient count with:', payload);

    const response = await apiClient.post("/admin/users/count-by-filters", payload);
    if (response.data.success) {
      console.log('Recipient count result:', response.data.count);
      setRecipientCount(response.data.count);
    }
  } catch (err: any) {
    console.error("Calculate recipient count error:", err);
  }
}, [targetType, selectedRoles, selectedUsers]);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchedUsers([]);
      return;
    }

    try {
      const response = await apiClient.get(`/admin/users/search?q=${encodeURIComponent(query)}`);
      if (response.data.success) {
        setSearchedUsers(response.data.users || []);
      }
    } catch (err: any) {
      console.error("Search users error:", err);
    }
  };

  const sendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    setSending(true);
    try {
      const response = await apiClient.post("/messages/send", {
        receiver_id: user.id,
        message: newMessage.trim()
      });

      if (response.data.success) {
        const sentMessage = response.data.message_data;
        setMessages(prev => [...prev, {
          ...sentMessage,
          is_own_message: true
        }]);
        setNewMessage("");
        
        toast({
          title: "Message Sent",
          description: `Message delivered to ${user.name}`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const sendAnnouncement = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!announcementTitle.trim() || !announcementMessage.trim()) return;

  setSending(true);
  try {
    const payload = {
      title: announcementTitle,
      message: announcementMessage,
      priority: priority,
      target_type: targetType,
      target_roles: selectedRoles,
      target_users: selectedUsers.map(u => u.id),
      send_at: isScheduled && sendAt ? sendAt : null,
      template_id: selectedTemplate || null,
    };

    // DEBUG: Log what we're sending
    console.log('Sending announcement with payload:', {
      ...payload,
      target_roles: selectedRoles,
      target_users_count: selectedUsers.length
    });

    const response = await apiClient.post("/admin/announcements", payload);

    if (response.data.success) {
      toast({
        title: isScheduled ? "Announcement Scheduled" : "Announcement Sent",
        description: isScheduled 
          ? `Announcement scheduled for delivery` 
          : `Announcement sent to ${recipientCount} users`,
      });

      // Reset form
      setAnnouncementTitle("");
      setAnnouncementMessage("");
      setSelectedRoles([]);
      setSelectedUsers([]);
      setSelectedTemplate("");
      setIsScheduled(false);
      setSendAt("");
    }
  } catch (err: any) {
    console.error('Announcement sending error:', err);
    toast({
      title: "Error",
      description: err.response?.data?.message || "Failed to send announcement",
      variant: "destructive",
    });
  } finally {
    setSending(false);
  }
};

  const applyTemplate = (template: AnnouncementTemplate) => {
    setAnnouncementTitle(template.title);
    setAnnouncementMessage(template.message);
    setPriority(template.suggested_priority as Priority);
    setTargetType(template.suggested_target_type as TargetType);
    setSelectedTemplate(template.id.toString());
    setActiveTab("announcement");
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const addUser = (user: User) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(prev => [...prev, user]);
    }
    setUserSearch("");
    setSearchedUsers([]);
  };

  const removeUser = (userId: number) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  const availableRoles = ['student', 'tutor', 'admin', 'staff', 'financial_admin'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0 pb-4 border-b">
          {user && (
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    <span className="truncate">{user.name}</span>
                    <Badge variant="secondary" className="capitalize">
                      {user.role}
                    </Badge>
                  </DialogTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-3 mb-4 shrink-0">
            <TabsTrigger value="direct">Direct Message</TabsTrigger>
            <TabsTrigger value="announcement">Official Announcement</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Direct Message Tab */}
<TabsContent value="direct" className="flex-1 flex flex-col min-h-0">
  {/* Messages Area - Fixed height with proper scrolling */}
  <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
    <ScrollArea 
      ref={scrollAreaRef} 
      className="h-full"
    >
      <div className="p-4">
        {messagesLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
            <p className="text-muted-foreground">
              Start a conversation with {user?.name}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-3">
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    {date}
                  </Badge>
                </div>
                {dateMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_own_message ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.is_own_message
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {!message.is_own_message && (
                          <span className="text-xs font-medium">
                            {message.sender_name}
                          </span>
                        )}
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  </div>

  {/* Message Input - Fixed at bottom */}
  <form onSubmit={sendDirectMessage} className="shrink-0 pt-4">
    <div className="flex gap-2">
      <Input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
        disabled={sending}
        className="flex-1"
      />
      <Button 
        type="submit" 
        size="icon"
        disabled={sending || !newMessage.trim()}
      >
        {sending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </div>
  </form>
</TabsContent>

          {/* Official Announcement Tab - FIXED SCROLLING */}
          <TabsContent value="announcement" className="flex-1 min-h-0">
            <ScrollArea ref={announcementScrollRef} className="h-full">
              <div className="pr-4 space-y-6 pb-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Send Official Announcement
                    </CardTitle>
                    <CardDescription>
                      Create and send an official announcement to multiple users
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Template Selection */}
                    <div className="space-y-2">
                      <Label>Quick Templates</Label>
                      <Select value={selectedTemplate} onValueChange={(value) => {
                        const template = templates.find(t => t.id.toString() === value);
                        if (template) applyTemplate(template);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map(template => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              {template.name} ({template.usage_count} uses)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Target Selection */}
                    <div className="space-y-4">
                      <Label>Target Audience</Label>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Target Type</Label>
                          <Select value={targetType} onValueChange={(value: TargetType) => setTargetType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Users</SelectItem>
                              <SelectItem value="roles">By Role</SelectItem>
                              <SelectItem value="specific">Specific Users</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Role Selection */}
                      {targetType === 'roles' && (
                        <div className="space-y-2">
                          <Label>Select Roles</Label>
                          <div className="flex flex-wrap gap-2">
                            {availableRoles.map(role => (
                              <div key={role} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`role-${role}`}
                                  checked={selectedRoles.includes(role)}
                                  onCheckedChange={() => toggleRole(role)}
                                />
                                <Label htmlFor={`role-${role}`} className="text-sm capitalize">
                                  {role.replace('_', ' ')}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Specific User Selection */}
                      {targetType === 'specific' && (
                        <div className="space-y-3">
                          <Label>Select Specific Users</Label>
                          
                          {/* User Search */}
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                value={userSearch}
                                onChange={(e) => {
                                  setUserSearch(e.target.value);
                                  searchUsers(e.target.value);
                                }}
                                placeholder="Search users by name or email..."
                                className="flex-1"
                              />
                            </div>
                            
                            {/* Search Results */}
                            {searchedUsers.length > 0 && (
                              <div className="border rounded-lg max-h-32 overflow-y-auto">
                                {searchedUsers.map(user => (
                                  <div
                                    key={user.id}
                                    className="flex items-center gap-3 p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                                    onClick={() => addUser(user)}
                                  >
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={user.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{user.name}</p>
                                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {user.role}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Selected Users */}
                          {selectedUsers.length > 0 && (
                            <div className="space-y-2">
                              <Label>Selected Users ({selectedUsers.length})</Label>
                              <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                                {selectedUsers.map(user => (
                                  <div key={user.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback className="text-xs">
                                          {user.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm">{user.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {user.role}
                                      </Badge>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeUser(user.id)}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Recipient Count */}
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4" />
                        <span>This announcement will be sent to approximately </span>
                        <Badge variant="secondary">{recipientCount}</Badge>
                        <span>users</span>
                      </div>
                    </div>

                    {/* Message Composition */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="announcement-title">Announcement Title *</Label>
                        <Input
                          id="announcement-title"
                          value={announcementTitle}
                          onChange={(e) => setAnnouncementTitle(e.target.value)}
                          placeholder="Enter announcement title"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="announcement-message">Announcement Message *</Label>
                        <Textarea
                          id="announcement-message"
                          value={announcementMessage}
                          onChange={(e) => setAnnouncementMessage(e.target.value)}
                          placeholder="Enter your official announcement message..."
                          rows={6}
                          required
                        />
                      </div>
                    </div>

                    {/* Scheduling */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={isScheduled}
                          onCheckedChange={setIsScheduled}
                        />
                        <Label htmlFor="scheduling">Schedule for later</Label>
                      </div>

                      {isScheduled && (
                        <div className="space-y-2">
                          <Label>Schedule Date & Time</Label>
                          <Input
                            type="datetime-local"
                            value={sendAt}
                            onChange={(e) => setSendAt(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Send Button */}
                    <Button
                      onClick={sendAnnouncement}
                      disabled={sending || !announcementTitle.trim() || !announcementMessage.trim() || recipientCount === 0}
                      className="w-full"
                      size="lg"
                    >
                      {sending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      {isScheduled ? 'Schedule Announcement' : 'Send Announcement Now'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="pr-4 space-y-6 pb-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Announcement Templates
                    </CardTitle>
                    <CardDescription>
                      Manage and create templates for common announcements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {templates.map(template => (
                        <Card key={template.id} className="cursor-pointer hover:bg-muted/50" onClick={() => applyTemplate(template)}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{template.name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {template.usage_count} uses
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{template.title}</p>
                                <p className="text-sm line-clamp-2">{template.message}</p>
                              </div>
                              <Button variant="ghost" size="sm">
                                Use Template
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {templates.length === 0 && (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-foreground mb-2">No templates yet</h3>
                          <p className="text-muted-foreground">
                            Create your first announcement template to save time
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}